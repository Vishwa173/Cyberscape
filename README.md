link - https://vishwa173.github.io/Cyberscape/

CYBERSCAPE

In the collapsing cyber-city of Cyberia, the central AI system AUREX is breaking down, unleashing chaos. The last hope lies in Revant, Nivitha, and Miruthul—tasked with decrypting Data Shards and restoring the AI before total collapse.

Time is running out. Hostile threats are everywhere.
Can they save Cyberia?

Black Areas – These are buildings; they are not walkable and block player movement.

Green Areas – These represent grass or open spaces; they are walkable and the player can move freely on them.

Thick Black Grid Lines – These act as roads or paths between the tiles; they are walkable and connect different parts of the map.

Cyan Tile – This is the base station where the player delivers shards.

Red Sectors - they are the detection or vision areas of surveillance towers, showing where they can spot the player.

1. Game Setup

1.1 Map & Environment

Top-down view: Players see the city from above, including roads, buildings, and open zones.

Procedural generation: A new city layout is created each game, keeping gameplay fresh and unpredictable.

1.2 Objective

Collect Keys: Found at random locations throughout the map.

Decrypt Data Shards: Keys can be used to decrypt locked shards present at the Central Hub.

Deliver to Base Station: Decrypted shards should be transported to the Base Station to boost system health.

Maintain System Health: System health depletes over time; delivering Shards keeps the AUREX (system) alive.

1.3 Data Shards & Keys

Random Key Placement: Keys should be placed at different randomized locations over the map.

Keys as Currency: Keys are used for decrypting Data Shards.

Shard Requirements: Each Shard requires a specific number of keys.

1.4 Movement Rules

Navigable Terrain: Movement is allowed on roads and open areas.

Blocked Structures: Buildings and certain obstacles cannot be crossed.

1.5 User Interface

Display necessary elements like system health, player health, number of keys, and shard, etc.

1.6 Win/Loss Conditions

Win: System Health reaches 100%.

Loss:

Player’s health drops to zero.

System Health falls below the critical limit and can't recover in time.

2. Buildings

2.1 Surveillance Towers

Fixed Locations: Towers are placed at specific spots on the map.

Rotating Detection: Each tower sweeps a rotating cone-shaped vision area.

Hostile Behavior: Player is attacked by the tower when entering the detection zone, resulting in reduction of the player's health continuously.

2.2 Central Hub

The Central Hub continuously mines and stores encrypted Data Shards, which cannot be used until decrypted. When players bring keys to the hub, each Data Shard consumes a fixed number of keys for decryption. Once decrypted, the shards become usable and can later be delivered to the Base Station.

2.3 Base Station

This is where the AUREX supercomputer is located.

All the decrypted data shards should be delivered to the base station to get AUREX up and running.

Delivering decrypted Data Shards to the Base Station restores a portion of the continuously decreasing system health, helping to keep the AUREX alive.

3. Game Modes

Normal Mode

~~Unique Maps: A unique and playable map should be generated for every game session.~~

~~Tower Combat: Implement rotating surveillance towers as described in point 2.1.~~

~~Game Controls: Pause, resume, and reset options.~~

~~Local Progress Storage: Saves high scores via localStorage.~~

~~Combat System:~~

~~Players can shoot bullets.~~

~~These bullets follow the law of reflection, bouncing off surfaces at equal angles relative to the normal and gradually losing speed with each bounce.~~

~~Infinite ammunition (i.e., bullets).~~

~~The survillance towers can be destroyed by these bullets.~~

Hacker Mode

~~Add Power Ups that spawn at different locations in the maps:~~

~~Health Packs to restore player health.~~

~~Invisibility Shields to hide from enemies.~~

~~Bot Enemies:~~

~~Bot Enemies patrol the roads across the map and actively monitor for player presence.~~

~~Each bot has a circular detection range; when a player enters this area, the bot locks on, chases the player, and opens fire if within shooting distance.~~

~~If the player manages to escape the detection radius, the bot will stop chasing and return to its original patrol route. This behavior adds tension and strategic depth to navigating the map.~~

~~Bot Types: Add different types of bots, each with distinct behaviors and combat roles. The mandatory ones are given below:~~

~~Light Bots: are quick and agile but have low health, making them easy to eliminate if caught.~~

~~Heavy Bots: move slowly but are tough to defeat due to their high health.~~

~~Snipers: specialize in long-range attacks (i.e, larger vision area), posing a significant threat from a distance.~~

~~Marketplace System:~~

~~Create a Marketplace System where players can spend unused Data Shards to purchase various items.~~

~~These include weapons such as various rifles and guns, upgrades like increased movement speed or fire rate, and essential utilities like health packs and shields to enhance survivability and combat effectiveness.~~

~~Animated Sprites:~~

~~Use animated sprite sheets to visually represent characters and towers.~~

~~Bot Factory:~~

~~Implement a Bot Factory that periodically spawns enemy bots on the map. The spawn rate should increase gradually over time, adding pressure and escalating difficulty as the game progresses.~~

~~Safe Zones:~~

~~Design Safe Zones on the map where players are completely immune to damage.~~

~~When a player enters a Safe Zone, all hostile bots and surveillance towers immediately disengage and stop attacking, allowing the player a moment to recover, strategize, or manage inventory without threat.~~

Hacker++ Mode

Endless Map: Implement an infinite map with no boundaries.

~~City-Wide Alerts:~~

~~Implement a City-Wide Alert system where picking up a Key instantly alerts all bots on the map.~~

~~Upon activation, every bot begins to chase the player regardless of their location, dramatically increasing the challenge and urgency of escaping or reaching a safe zone.~~

~~Data Mines:~~

~~Add Data Mines as purchasable items in the marketplace.~~

~~Players can buy and place them strategically on the map to automatically generate Data Shards over time.~~

~~Data Mines require a build-up period after placement before they start producing Data Shards.~~

~~Each mine has a fixed production rate and a maximum capacity, requiring players to return periodically to collect the generated shards.~~

~~These data shards are already decrypted, i.e., they do not require keys to be decrypted.~~

~~Teleportation Points:~~

~~Teleportation Points allow players to strategically purchase and place teleport hubs anywhere on the map.~~

~~Each hub can be given a custom label for easy recognition and organization. Players can instantly travel between these hubs.~~
