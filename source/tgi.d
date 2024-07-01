module sc4.tgi;

/// See_Also: $(OL
///   $(LI <a href="https://www.wiki.sc4devotion.com/index.php?title=Type_Group_Instance">Type Group Instance</a> (SC4D Encyclopedia))
///   $(LI <a href="https://www.wiki.sc4devotion.com/index.php?title=Type_ID">Type ID</a> (SC4D Encyclopedia))
///   $(LI <a href="https://www.wiki.sc4devotion.com/index.php?title=InstanceFormats">Instance Formats</a> (SC4D Encyclopedia))
/// )
enum KnownType : uint {
  /// See_Also: <a href="https://www.wiki.sc4devotion.com/index.php?title=Cohort">Cohort</a> (SC4D Encyclopedia)
  cohort = 0x05342861,
  /// See_Also: <a href="https://wiki.sc4devotion.com/index.php?title=S3D">S3D</a> (SC4D Encyclopedia)
  s3d = 0x5AD0E817,
  /// See_Also: <a href="https://www.wiki.sc4devotion.com/index.php?title=Exemplar">Type ID</a> (SC4D Encyclopedia)
  exemplar = 0x6534284A
}

/// See_Also: $(OL
///   $(LI <a href="https://www.wiki.sc4devotion.com/index.php?title=Type_Group_Instance">Type Group Instance</a> (SC4D Encyclopedia))
///   $(LI <a href="https://www.wiki.sc4devotion.com/index.php?title=Group_ID">Group ID</a> (SC4D Encyclopedia))
///   $(LI <a href="https://www.wiki.sc4devotion.com/index.php?title=Instance_ID">Instance ID</a> (SC4D Encyclopedia))
///   $(LI <a href="https://www.wiki.sc4devotion.com/index.php?title=InstanceFormats">Instance Formats</a> (SC4D Encyclopedia))
/// )
enum KnownGroup : uint {
  udiSounds = 0x8A5971C5,
  udiData = 0x8A5971C5,
  propAnimations = 0x2A2458F9,
  animations = 0x49A593E7,
  propAnimation = 0x2A2458F9,
  animation = 0x49A593E7,
  regionTileLayout = 0x6A1EED2C,
  sc4VanillaToolBitmap = 0x1D6962CF,
  bridgeSpecificationRule = 0xAA5BCF57,
  sc4Config = 0x49DD6E08,
  corruptLot = 0xA8FBD372,
  dbpf = 0x6A5B7B57,
  /// See_Also: `KnownInstance.dir`.
  dir = 0xE86B1EEF,
  effectResourceTree = 0xEA5118B1,
  hitAudioTrack = 0xCA4D19E3,
  soundHitLists = 0x9dbdbf74,
  /// Font INI
  fontIni = 0x4A87BFE8,
  /// Terrain Mapping INI
  terrainMappingIni = 0x8A5971C5,
  /// Path Remapping INI
  pathRemappingIni = 0x8A5971C5,
  /// Sound INI
  soundIni = 0x8A5971C5,
  /// Features INI
  featuresIni = 0x8A5971C5,
  /// JPEG & JFIF Art
  jpegArt = 0xCA133ECB,
  /// KEYCFG Accelerator Tables
  keyCfg = 0x6A231EAA,
  /// Track Logic Object
  trackLogic = 0xCA4D19E3,
  /// Lot Data
  lotData = 0x6BE74C60,
  /// Missions, Advisors, Tutorials and Packaging files
  lua = 0x4A5E8EF6,
  /// Generators, Attractors, Repulsors, and System LUAs
  luaSystems = 0x4A5E8F3F,
  /// MAD Movie Files
  movies = 0x00000001,

}

///
enum CohortGroup : uint {
  /// Civic and Park Building
  civicAndParkBuilding = 0x07BDDF1C,
  /// Vehicle Type
  vehicleType = 0x096E6739,
  /// Watercraft
  watercraft = 0x096E6817,
  /// Aircraft
  aircraft = 0x296E680F,
  /// Zonable Commercial Building
  zonableCommercialBuilding = 0x47BDDF12,
  /// Zonable Residential Building
  zonableResidentialBuilding = 0x67BDDF0C,
  /// Data view
  dataView = 0x690F693F,
  /// MySim
  mySim = 0x6A297266,
  /// Clouds
  clouds = 0x7A4A8458,
  /// Zonable Industrial Building
  zonableIndustrialBuilding = 0xA7BDDF17,
  /// Building Foundations
  buildingFoundations = 0xA8FBD372,
  /// Crime Simulator
  crimeSimulator = 0xC96E6806,
  /// Ambience Layer
  ambienceLayer = 0xCA25875D,
  /// Landmark
  landmark = 0xCA386E22
}

enum CursorGroup : uint {
  /// Black & White Cursors
  blackAndWhite = 0x00000001,
  /// 4-bit Cursors
  fourBit = 0x00000004,
  /// 8-bit Cursors
  eightBit = 0x00000008,
  /// 32-bit Cursors
  fullColor = 0x00000032
}

enum ExemplarGroup : uint {
  /// Civic and Park Buildings
  civicAndParkBuildings = 0x07BDDF1C,
  /// Network Placement Tuning Parameters
  networkPlacementTuningParameters = 0x084344E0,
  /// Power Poles
  powerPoles = 0x088E1962,
  /// Land Vehicle Types
  landVehicleTypes = 0x096E6739,
  /// Water Vehicle Types
  waterVehicleTypes = 0x096E6817,
  /// Bridge Pieces Network Part Assignment
  bridgePiecesNetworkPartAssignment = 0x2821ED93,
  /// Air Vehicle Types
  airVehicleTypes = 0x296E680F,
  //Construction Properties
  constructionProperties = 0x2989FD57,
  /// Disasters
  disasters = 0x29B6C670,
  /// Menu Items
  menuItems = 0x2A3858E4,
  /// Commercial Developer
  commercialDeveloper = 0x47BDDF12,
  /// Residential Developer
  residentialDeveloper = 0x67BDDF0C,
  /// Industrial Developer
  industrialDeveloper = 0xA7BDDF17,
  /// Building Behavior Simulators
  buildingBehaviorSimulators = 0x67CD5FA1,
  /// Dataview and UDrive-It Interfaces
  dataviewAndUDriveItInterfaces = 0x690F693F,
  /// God Mode Terrain Tools
  godModeTerrainTools = 0x6A01FC2A,
  /// MySims
  mySims = 0x6A297266,
  /// Tuning Parameters & Background Loaders
  tuningParametersAndBackgroundLoaders = 0x7A4A8458,
  /// Fluid Dynamics Properties
  fluidDynamicsProperties = 0x88CD66E9,
  /// Supports
  supports = 0x8974F80F,
  /// Transit Pieces (except light rail)
  /// See_Also: `ExemplarGroup.lightRailPieces`
  transitPieces = 0x89AC5643,
  /// Light Rail Pieces
  /// See_Also: `ExemplarGroup.transitPieces`
  lightRailPieces = 0x2B79DFFB,
  /// Textures
  textures = 0x89C2A517,
  /// Rewards
  rewards = 0x8A3858D8,
  /// Bridge Pieces Main Definition
  bridgePiecesMainDefinition = 0xA82CA30F,
  /// Highway Pieces Definitions
  highwayPiecesDefinitions = 0xA8434037,
  /// Building Lots
  buildingLots = 0xA8FBD372,
  /// Lighting
  lighting = 0xA9189CF0,
  /// Automata Tuning
  automataTuning = 0xA998D30B,
  /// Ordinances
  ordinances = 0xA9C2C209,
  /// Demand Simulator
  demandSimulator = 0xC7BB4816,
  /// Utility Buildings
  utilityBuildings = 0xC8DBCCBA,
  /// Crime Props
  crimeProps = 0xC96E6806,
  /// Props
  props = 0xC977C536,
  /// Ambiance Layer Functionality
  ambianceLayerFunctionality = 0xCA25875D,
  /// Landmarks
  landmarks = 0xCA386E22,
  /// Graphs
  graphs = 0xCA4AD545,
  /// Avenue Bridge Pieces Resources
  avenueBridgePiecesResources = 0xCB730FAC,
  /// One way Network Intersections
  oneWayNetworkIntersections = 0xCBE084CB,
  /// Road Tunnel
  roadTunnel = 0xCBE084CB,
  /// Simulators
  simulators = 0xE7E2C2DB,
  /// Rail & Highway Bridge Pieces Resources
  railAndHighwayBridgePiecesResources = 0xE8347989,
  /// Rail Tunnel
  RailTunnel = 0xE8347989,
  /// Trees
  trees = 0xE83E0437,
  /// Crimes
  crimes = 0xEA12F32C,
  /// Monorail & Light Rail 3D Transportation Pieces
  monorailAndLightRail = 0xEBE084C2,
  /// Ground Highway 3D Transportation Pieces
  groundHighway = 0xEBE084d1,
}

enum SoundGroup : uint {
  /// Construction
  construction = 0x0A5BCDA5,
  /// Nature Day
  natureDay = 0x4A398E40,
  /// Nature Night
  natureNight = 0x2A398E45,
  /// Traffic Midtown/Medium
  trafficMidtown = 0x4A42C073,
  /// Traffic Downtown
  trafficDowntown = 0x8A42B774,
  /// Traffic Street
  trafficStreet = 0x8A60CE80,
  /// Traffic Jam
  trafficJam = 0xEA5E6AC2,
  /// Traffic Highway
  trafficHighway = 0xEA60CE77,
  /// Pipe View
  pipeView = 0x4A54E37F,
  /// Subway View
  subwayView = 0x4A54E387,
  /// High Crime
  highCrime = 0x4A5E6AC5,
  /// Farm Buildings
  farmBuildings = 0x4A5E7BE3,
  /// Farm Fields
  farmFields = 0x4A60CE67,
  /// Zoo
  zoo = 0x8A60CF62,
  /// Garbage
  garbage = 0xAA39BA06,
  /// Traffic Road Light
  trafficRoadLight = 0xAA60CE7D,
  /// Abandoned
  abandoned = 0xCA88CC85,
  /// Water
  water = 0xEA39BA3E,
  /// Residential Good Day
  residentialGoodDay = 0xEA62790C,
  /// Residential Good Day Small/Medium $$$
  residentialGoodDayHighWealth = 0x8A627912,
  /// Residential Good Day Small/Medium
  residentialGoodDaySmall = 0xCA62790F,
  /// Residential Bad Day Small/Medium
  residentialBadDay = 0xEA6278FD,
  /// Residential Bad Day Large
  residentialBadDayLarge = 0x2A6278EE,
  /// Residential Good Night Small/Medium
  residentialGoodNight = 0xEA627915,
  /// Residential Bad Night Small/Medium
  residentialBadNight = 0x0A627909,
  /// Residential Bad Night Large
  residentialBadNightLarge = 0x4A627900,
  /// Industrial Clean Good
  industrialCleanGood = 0xEA398E29,
  /// Industrial Clean Bad
  industrialCleanBad = 0x4A392CFF,
  /// Industrial Dirty Good
  industrialDirtyGood = 0x8A398E3C,
  /// Industrial Dirty Bad
  industrialDirtyBad = 0xCA398E36,
  /// City at Zoom 3
  city = 0xEA627918,
  /// Wind Zoom 1&2
  wind = 0xCA398E4A,
  /// Wind Zoom 3
  windZoom3 = 0xEA62791B,
  /// Activation Sounds
  activationSounds = 0x0A4D1926,
  /// Audio Loop ID
  audioLoop = 0x0A4D1926,
  /// Fireworks Effects
  fireworkEffects = 0x0A4D192D,
  /// Riots Effects
  riotsEffects = 0x0A4D192D,
  /// Children Effects
  childrenEffects = 0x0A4D192D,
  /// Anger Effects
  angerEffects = 0x0A4D192D,
  /// Demo (demolition?) Effects
  demoEffects = 0x0A4D192D,
  /// Crime Effects
  crimeEffects = 0x0A4D192D,
  /// Construction Effects
  constructionEffects = 0x0A4D192D,
  /// Jet Effects
  jetEffects = 0x0A4D192D,
  /// Query Sounds
  query = 0x2A4D1940,
  /// Plop Effects
  plop = 0x4A4D1946,
  /// Button Click Effects
  buttonClick = 0x4A4D1946,
  /// Ambience Decay Effects
  ambienceDecay = 0x4A4D1946,
  /// Wire
  wire = 0x4A4D1946,
  /// Fire Effects
  fire = 0x4A4D1946,
  /// Tools Effects
  tools = 0x4A4D1946,
  /// Disaster Effects
  disaster = 0x6A4D193A,
  /// Destruction Effects
  destruction = 0x6A4D193A,
  /// Siren Effects
  siren = 0x6A4D193A,
  /// Splash Effects
  splash = 0x6A4D193A,
  /// Low Pitch Ambient Effects
  lowPitchAmbientEffect = 0x6A4D193A,
  /// Fireworks Effects
  fireworks = 0xAA4D1933,
  /// Construction Effects
  constructionEffectsCntd = 0xAA4D1933,
  /// Sims Effects
  sims = 0xAA4D1933,
  /// UDI Effects
  udi = 0xAA4D1933,
  /// Alien Effects
  aliens = 0xAA4D1933,
  /// Crowd Effects
  crowds = 0xAA4D1933,
  /// Animals Effects
  animalsEffects = 0xAA4D1933,
  /// Occupant Instance Sounds
  occupantInstance = 0xAA4D194B,
}

enum TextGroup : uint {
  /// Misc. Item Names
  miscItemNames = 0xEA5524EB,
  /// Misc. Item Names
  miscItemNamesCntd = 0x6A554AFD,
  /// Misc. Descriptions
  miscDescriptions = 0xEA5524EB,
  /// Misc. Descriptions
  miscDescriptionsCntd = 0x6A554AFD,
  /// Misc. Texts
  misc = 0xEA231E96,
  /// Popup window HTML
  popupWindowHtml = 0xCA554B03,
  /// Audio file name-to-description
  audioFileNameToDescription = 0x8A635D24,
  /// Disasters
  disaster = 0x8A5E03EC,
  /// About SC4 window HTML
  aboutSc4WindowHtml = 0x8A4924F3,
  /// Game UI
  gameUi = 0x6A3FF01C,
  /// Interactivity Feature Text (MySim, UDriveIt, etc.)
  interactivityFeature = 0x6A231EAA,
  /// News ticker message
  newsTickerMessage = 0x6A231EA4,
  /// Terrain tool
  terrainTool = 0x4A5E093C,
  /// Funny random city loading message
  cityLoadingMessage = 0x4A5CB171,
  /// Item plop notification
  itemPlopNotification = 0x2A592FD1,
  /// Item draw notification
  drawNotification = 0x2A592FD1,
  /// General UI
  generalUI = 0x0A554AE8,
  /// Item visible name
  itemVisibleName = 0x0A554AE0,
  /// Item visible description
  itemVisibleDescription = 0x0A554AE0,
  /// In-game error
  inGameError = 0x0A419226,
  /// Population Text
  population = 0x6a4eb3f7,
  /// Plugin Install Text
  pluginInstall = 0xEAFCB180,
  /// De-Localizer - used to avoid language localization.
  unlocalized = 0x6A231EAA
}
