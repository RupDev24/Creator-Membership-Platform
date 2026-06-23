#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contractevent,
    Address, Env, String, Symbol, Vec, Map,
    log,
};

// ═══════════════════════════════════════════════════════════════
// Data Types
// ═══════════════════════════════════════════════════════════════

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct Tier {
    pub name: String,
    pub price: u64,       // price in stroops (1 XLM = 10_000_000 stroops)
    pub duration_days: u64,
}

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct CreatorProfile {
    pub id: u64,
    pub address: Address,
    pub name: String,
    pub tiers: Vec<Tier>,
    pub subscriber_count: u64,
    pub total_earned: u64,
    pub created_at: u64,
}

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct Membership {
    pub subscriber: Address,
    pub creator_id: u64,
    pub tier_index: u32,
    pub amount_paid: u64,
    pub subscribed_at: u64,
    pub expires_at: u64,
    pub is_active: bool,
}

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct LeaderboardEntry {
    pub creator_id: u64,
    pub name: String,
    pub subscriber_count: u64,
    pub total_earned: u64,
}

// ═══════════════════════════════════════════════════════════════
// Storage Keys
// ═══════════════════════════════════════════════════════════════

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    CreatorCount,
    Creator(u64),
    CreatorByAddr(Address),
    Membership(Address, u64), // (subscriber, creator_id)
    SubscriptionCount,
    EventCount,
}

// ═══════════════════════════════════════════════════════════════
// Contract Events (Protocol 23 / Whisk syntax)
// ═══════════════════════════════════════════════════════════════

#[contractevent]
pub struct CreatorRegistered {
    #[topic]
    pub creator: Address,
    pub creator_id: u64,
    pub name: String,
    pub timestamp: u64,
}

#[contractevent]
pub struct MembershipCreated {
    #[topic]
    pub subscriber: Address,
    #[topic]
    pub creator_id: u64,
    pub tier_index: u32,
    pub amount: u64,
    pub timestamp: u64,
}

#[contractevent]
pub struct MembershipRenewed {
    #[topic]
    pub subscriber: Address,
    #[topic]
    pub creator_id: u64,
    pub tier_index: u32,
    pub amount: u64,
    pub timestamp: u64,
}

#[contractevent]
pub struct MembershipCancelled {
    #[topic]
    pub subscriber: Address,
    #[topic]
    pub creator_id: u64,
    pub timestamp: u64,
}

// ═══════════════════════════════════════════════════════════════
// Contract
// ═══════════════════════════════════════════════════════════════

#[contract]
pub struct CreatorMembershipContract;

#[contractimpl]
impl CreatorMembershipContract {

    // ─── Initialize ───────────────────────────────────────────
    /// Initialize the contract with an admin address.
    /// Can only be called once.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::CreatorCount, &0u64);
        env.storage().instance().set(&DataKey::SubscriptionCount, &0u64);
        env.storage().instance().set(&DataKey::EventCount, &0u64);
        log!(&env, "Contract initialized with admin: {}", admin);
    }

    // ─── Register Creator ─────────────────────────────────────
    /// A creator registers their profile with a name and list of tiers.
    pub fn register_creator(
        env: Env,
        creator: Address,
        name: String,
        tiers: Vec<Tier>,
    ) -> u64 {
        creator.require_auth();

        // Ensure creator hasn't already registered
        if env.storage().persistent().has(&DataKey::CreatorByAddr(creator.clone())) {
            panic!("creator already registered");
        }

        // Validate tiers
        if tiers.is_empty() {
            panic!("must provide at least one tier");
        }

        // Get and increment creator count
        let creator_id: u64 = env.storage().instance().get(&DataKey::CreatorCount).unwrap_or(0);
        let new_count = creator_id + 1;
        env.storage().instance().set(&DataKey::CreatorCount, &new_count);

        let timestamp = env.ledger().timestamp();

        let profile = CreatorProfile {
            id: creator_id,
            address: creator.clone(),
            name: name.clone(),
            tiers,
            subscriber_count: 0,
            total_earned: 0,
            created_at: timestamp,
        };

        // Store creator profile
        env.storage().persistent().set(&DataKey::Creator(creator_id), &profile);
        env.storage().persistent().set(&DataKey::CreatorByAddr(creator.clone()), &creator_id);

        // Emit event
        CreatorRegistered {
            creator: creator.clone(),
            creator_id,
            name,
            timestamp,
        }.publish(&env);

        // Bump TTL for persistent storage (extend to ~30 days)
        env.storage().persistent().extend_ttl(
            &DataKey::Creator(creator_id),
            518400, // ~30 days in ledgers (5s per ledger)
            518400,
        );

        log!(&env, "Creator registered: id={}, addr={}", creator_id, creator);
        creator_id
    }

    // ─── Subscribe ────────────────────────────────────────────
    /// A fan subscribes to a creator's tier by paying the tier price.
    pub fn subscribe(
        env: Env,
        subscriber: Address,
        creator_id: u64,
        tier_index: u32,
    ) -> Membership {
        subscriber.require_auth();

        // Load creator profile
        let mut creator: CreatorProfile = env.storage().persistent()
            .get(&DataKey::Creator(creator_id))
            .expect("creator not found");

        // Validate tier index
        if tier_index >= creator.tiers.len() {
            panic!("invalid tier index");
        }

        // Check subscriber isn't already subscribed
        let membership_key = DataKey::Membership(subscriber.clone(), creator_id);
        if env.storage().persistent().has(&membership_key) {
            let existing: Membership = env.storage().persistent().get(&membership_key).unwrap();
            if existing.is_active {
                panic!("already subscribed to this creator");
            }
        }

        let tier = creator.tiers.get(tier_index).expect("tier not found");
        let timestamp = env.ledger().timestamp();
        let duration_seconds = tier.duration_days * 86400;

        // Create membership record
        let membership = Membership {
            subscriber: subscriber.clone(),
            creator_id,
            tier_index,
            amount_paid: tier.price,
            subscribed_at: timestamp,
            expires_at: timestamp + duration_seconds,
            is_active: true,
        };

        // Update creator stats
        creator.subscriber_count += 1;
        creator.total_earned += tier.price;
        env.storage().persistent().set(&DataKey::Creator(creator_id), &creator);

        // Store membership
        env.storage().persistent().set(&membership_key, &membership);

        // Increment subscription count
        let sub_count: u64 = env.storage().instance().get(&DataKey::SubscriptionCount).unwrap_or(0);
        env.storage().instance().set(&DataKey::SubscriptionCount, &(sub_count + 1));

        // Emit event
        MembershipCreated {
            subscriber: subscriber.clone(),
            creator_id,
            tier_index,
            amount: tier.price,
            timestamp,
        }.publish(&env);

        // Bump TTL
        env.storage().persistent().extend_ttl(
            &membership_key,
            518400,
            518400,
        );

        log!(&env, "Subscription created: subscriber={}, creator={}, tier={}", subscriber, creator_id, tier_index);
        membership
    }

    // ─── Renew Membership ─────────────────────────────────────
    /// Renew an existing membership.
    pub fn renew(
        env: Env,
        subscriber: Address,
        creator_id: u64,
    ) -> Membership {
        subscriber.require_auth();

        let membership_key = DataKey::Membership(subscriber.clone(), creator_id);
        let mut membership: Membership = env.storage().persistent()
            .get(&membership_key)
            .expect("membership not found");

        let mut creator: CreatorProfile = env.storage().persistent()
            .get(&DataKey::Creator(creator_id))
            .expect("creator not found");

        let tier = creator.tiers.get(membership.tier_index).expect("tier not found");
        let timestamp = env.ledger().timestamp();
        let duration_seconds = tier.duration_days * 86400;

        // Extend from current expiry or now, whichever is later
        let base_time = if membership.expires_at > timestamp {
            membership.expires_at
        } else {
            timestamp
        };

        membership.expires_at = base_time + duration_seconds;
        membership.is_active = true;
        membership.amount_paid += tier.price;

        // Update creator earnings
        creator.total_earned += tier.price;
        env.storage().persistent().set(&DataKey::Creator(creator_id), &creator);
        env.storage().persistent().set(&membership_key, &membership);

        // Emit event
        MembershipRenewed {
            subscriber: subscriber.clone(),
            creator_id,
            tier_index: membership.tier_index,
            amount: tier.price,
            timestamp,
        }.publish(&env);

        env.storage().persistent().extend_ttl(
            &membership_key,
            518400,
            518400,
        );

        log!(&env, "Membership renewed: subscriber={}, creator={}", subscriber, creator_id);
        membership
    }

    // ─── Cancel Membership ────────────────────────────────────
    /// Cancel an active membership.
    pub fn cancel_membership(
        env: Env,
        subscriber: Address,
        creator_id: u64,
    ) {
        subscriber.require_auth();

        let membership_key = DataKey::Membership(subscriber.clone(), creator_id);
        let mut membership: Membership = env.storage().persistent()
            .get(&membership_key)
            .expect("membership not found");

        if !membership.is_active {
            panic!("membership already cancelled");
        }

        membership.is_active = false;

        // Decrement creator subscriber count
        let mut creator: CreatorProfile = env.storage().persistent()
            .get(&DataKey::Creator(creator_id))
            .expect("creator not found");
        if creator.subscriber_count > 0 {
            creator.subscriber_count -= 1;
        }
        env.storage().persistent().set(&DataKey::Creator(creator_id), &creator);
        env.storage().persistent().set(&membership_key, &membership);

        let timestamp = env.ledger().timestamp();

        // Emit event
        MembershipCancelled {
            subscriber: subscriber.clone(),
            creator_id,
            timestamp,
        }.publish(&env);

        log!(&env, "Membership cancelled: subscriber={}, creator={}", subscriber, creator_id);
    }

    // ─── Read Functions ───────────────────────────────────────

    /// Get a creator's profile by ID.
    pub fn get_creator(env: Env, creator_id: u64) -> CreatorProfile {
        env.storage().persistent()
            .get(&DataKey::Creator(creator_id))
            .expect("creator not found")
    }

    /// Get a membership record.
    pub fn get_membership(env: Env, subscriber: Address, creator_id: u64) -> Membership {
        env.storage().persistent()
            .get(&DataKey::Membership(subscriber, creator_id))
            .expect("membership not found")
    }

    /// Get the total number of registered creators.
    pub fn get_creator_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::CreatorCount).unwrap_or(0)
    }

    /// Get total number of subscriptions.
    pub fn get_subscription_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::SubscriptionCount).unwrap_or(0)
    }

    /// Get all creators (paginated — returns up to `limit` creators starting from `start`).
    pub fn get_all_creators(env: Env, start: u64, limit: u64) -> Vec<CreatorProfile> {
        let count: u64 = env.storage().instance().get(&DataKey::CreatorCount).unwrap_or(0);
        let mut creators = Vec::new(&env);
        let end = if start + limit > count { count } else { start + limit };

        let mut i = start;
        while i < end {
            if let Some(creator) = env.storage().persistent().get::<DataKey, CreatorProfile>(&DataKey::Creator(i)) {
                creators.push_back(creator);
            }
            i += 1;
        }
        creators
    }

    /// Get the leaderboard — top creators sorted by subscriber count.
    /// Returns up to `limit` entries.
    pub fn get_leaderboard(env: Env, limit: u64) -> Vec<LeaderboardEntry> {
        let count: u64 = env.storage().instance().get(&DataKey::CreatorCount).unwrap_or(0);
        let mut entries = Vec::new(&env);

        let mut i: u64 = 0;
        while i < count {
            if let Some(creator) = env.storage().persistent().get::<DataKey, CreatorProfile>(&DataKey::Creator(i)) {
                entries.push_back(LeaderboardEntry {
                    creator_id: creator.id,
                    name: creator.name,
                    subscriber_count: creator.subscriber_count,
                    total_earned: creator.total_earned,
                });
            }
            i += 1;
        }

        // Simple bubble sort by subscriber_count descending (fine for small lists)
        let len = entries.len();
        if len > 1 {
            let mut i: u32 = 0;
            while i < len - 1 {
                let mut j: u32 = 0;
                while j < len - 1 - i {
                    let a = entries.get(j).unwrap();
                    let b = entries.get(j + 1).unwrap();
                    if b.subscriber_count > a.subscriber_count {
                        entries.set(j, b);
                        entries.set(j + 1, a);
                    }
                    j += 1;
                }
                i += 1;
            }
        }

        // Trim to limit
        let result_limit = if (limit as u32) < len { limit as u32 } else { len };
        let mut result = Vec::new(&env);
        let mut i: u32 = 0;
        while i < result_limit {
            result.push_back(entries.get(i).unwrap());
            i += 1;
        }
        result
    }

    // ─── Admin Functions ──────────────────────────────────────

    /// Extend the contract instance TTL (admin only).
    pub fn extend_ttl(env: Env) {
        let admin: Address = env.storage().instance()
            .get(&DataKey::Admin)
            .expect("not initialized");
        admin.require_auth();

        env.storage().instance().extend_ttl(518400, 518400);
    }
}

// ═══════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(CreatorMembershipContract, ());
        let client = CreatorMembershipContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.initialize(&admin);

        assert_eq!(client.get_creator_count(), 0);
        assert_eq!(client.get_subscription_count(), 0);
    }

    #[test]
    fn test_register_creator() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(CreatorMembershipContract, ());
        let client = CreatorMembershipContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.initialize(&admin);

        let creator = Address::generate(&env);
        let name = String::from_str(&env, "Alice Creates");
        let mut tiers = Vec::new(&env);
        tiers.push_back(Tier {
            name: String::from_str(&env, "Basic"),
            price: 50_000_000, // 5 XLM
            duration_days: 30,
        });
        tiers.push_back(Tier {
            name: String::from_str(&env, "Premium"),
            price: 200_000_000, // 20 XLM
            duration_days: 30,
        });

        let id = client.register_creator(&creator, &name, &tiers);
        assert_eq!(id, 0);
        assert_eq!(client.get_creator_count(), 1);

        let profile = client.get_creator(&0u64);
        assert_eq!(profile.name, name);
        assert_eq!(profile.tiers.len(), 2);
        assert_eq!(profile.subscriber_count, 0);
    }

    #[test]
    fn test_subscribe_and_cancel() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(CreatorMembershipContract, ());
        let client = CreatorMembershipContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.initialize(&admin);

        let creator = Address::generate(&env);
        let name = String::from_str(&env, "Bob Builds");
        let mut tiers = Vec::new(&env);
        tiers.push_back(Tier {
            name: String::from_str(&env, "Supporter"),
            price: 10_000_000, // 1 XLM
            duration_days: 30,
        });

        client.register_creator(&creator, &name, &tiers);

        let subscriber = Address::generate(&env);
        let membership = client.subscribe(&subscriber, &0u64, &0u32);
        assert!(membership.is_active);
        assert_eq!(membership.amount_paid, 10_000_000);

        let profile = client.get_creator(&0u64);
        assert_eq!(profile.subscriber_count, 1);
        assert_eq!(profile.total_earned, 10_000_000);

        // Cancel
        client.cancel_membership(&subscriber, &0u64);
        let profile = client.get_creator(&0u64);
        assert_eq!(profile.subscriber_count, 0);
    }

    #[test]
    fn test_renew() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(CreatorMembershipContract, ());
        let client = CreatorMembershipContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.initialize(&admin);

        let creator = Address::generate(&env);
        let name = String::from_str(&env, "Charlie Creates");
        let mut tiers = Vec::new(&env);
        tiers.push_back(Tier {
            name: String::from_str(&env, "Monthly"),
            price: 30_000_000, // 3 XLM
            duration_days: 30,
        });

        client.register_creator(&creator, &name, &tiers);

        let subscriber = Address::generate(&env);
        client.subscribe(&subscriber, &0u64, &0u32);

        let renewed = client.renew(&subscriber, &0u64);
        assert_eq!(renewed.amount_paid, 60_000_000); // 2x price
        assert!(renewed.is_active);
    }

    #[test]
    fn test_leaderboard() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(CreatorMembershipContract, ());
        let client = CreatorMembershipContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.initialize(&admin);

        // Register 3 creators
        for i in 0..3u32 {
            let creator = Address::generate(&env);
            let name = String::from_str(&env, "Creator");
            let mut tiers = Vec::new(&env);
            tiers.push_back(Tier {
                name: String::from_str(&env, "Tier"),
                price: 10_000_000,
                duration_days: 30,
            });
            client.register_creator(&creator, &name, &tiers);
        }

        // Add subscribers to creator 1
        for _ in 0..3 {
            let sub = Address::generate(&env);
            client.subscribe(&sub, &1u64, &0u32);
        }

        // Add subscriber to creator 0
        let sub = Address::generate(&env);
        client.subscribe(&sub, &0u64, &0u32);

        let leaderboard = client.get_leaderboard(&10u64);
        assert_eq!(leaderboard.len(), 3);
        // First entry should be creator 1 with 3 subscribers
        assert_eq!(leaderboard.get(0).unwrap().creator_id, 1);
        assert_eq!(leaderboard.get(0).unwrap().subscriber_count, 3);
    }
}
