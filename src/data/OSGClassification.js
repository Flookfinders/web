import { adsDarkBlue } from "../utils/ADSColours";

export const OSGScheme = "Scottish Gazetteer Conventions v4.5";

const OSGClassification = [
  {
    id: "C",
    lookup: "Commercial",
    display: "Commercial",
    colour: adsDarkBlue,
  },
  {
    id: "CA",
    lookup: "Commercial Agricultural",
    display: "Commercial Agricultural",
    colour: adsDarkBlue,
  },
  {
    id: "CA01",
    lookup: "Commercial Agricultural Farm or non-residential associated building",
    display: "Farm or non-residential associated building",
    colour: adsDarkBlue,
  },
  {
    id: "CA02",
    lookup: "Commercial Agricultural Fishery",
    display: "Fishery",
    colour: adsDarkBlue,
  },
  {
    id: "CA03",
    lookup: "Commercial Agricultural Horticulture",
    display: "Horticulture",
    colour: adsDarkBlue,
  },
  {
    id: "CA04",
    lookup: "Commercial Agricultural Slaughter house or abattoir",
    display: "Slaughter house or abattoir",
    colour: adsDarkBlue,
  },
  {
    id: "CB",
    lookup: "Commercial Ancillary building",
    display: "Commercial Ancillary building",
    colour: adsDarkBlue,
  },
  {
    id: "CC",
    lookup: "Commercial Community Services",
    display: "Community Services",
    colour: adsDarkBlue,
  },
  {
    id: "CC02",
    lookup: "Commercial Community Services Law courts",
    display: "Law court",
    colour: adsDarkBlue,
  },
  {
    id: "CC03",
    lookup: "Commercial Community Services Prisons",
    display: "Prison",
    colour: adsDarkBlue,
  },
  {
    id: "CC04",
    lookup: "Commercial Community Services Public/village hall or other community facility",
    display: "Public/village hall or other community facility",
    colour: adsDarkBlue,
  },
  {
    id: "CC05",
    lookup: "Commercial Community Services Public Convenience",
    display: "Public Convenience",
    colour: adsDarkBlue,
  },
  {
    id: "CC06",
    lookup: "Commercial Community Services Cemetery, crematorium or graveyard. In current use",
    display: "Cemetery, crematorium or graveyard. In current use",
    colour: adsDarkBlue,
  },
  {
    id: "CC07",
    lookup: "Commercial Community Services Church hall or religious meeting place/hall",
    display: "Church hall or religious meeting place/hall",
    colour: adsDarkBlue,
  },
  {
    id: "CC08",
    lookup: "Commercial Community Services Community service centre",
    display: "Community service centre",
    colour: adsDarkBlue,
  },
  {
    id: "CC09",
    lookup: "Commercial Community Services Public household waste recycling centre",
    display: "Public household waste recycling centre",
    colour: adsDarkBlue,
  },
  {
    id: "CC10",
    lookup: "Commercial Community Services Recycling site",
    display: "Recycling site",
    colour: adsDarkBlue,
  },
  {
    id: "CC11",
    lookup: "Commercial Community Services CCTV",
    display: "CCTV",
    colour: adsDarkBlue,
  },
  {
    id: "CC12",
    lookup: "Commercial Community Services Job centre",
    displayText: "Job centre",
    colour: adsDarkBlue,
  },
  {
    id: "CE",
    lookup: "Commercial Education",
    display: "Education",
    colour: adsDarkBlue,
  },
  {
    id: "CE01",
    lookup: "Commercial Education College",
    display: "College",
    colour: adsDarkBlue,
  },
  {
    id: "CE02",
    lookup: "Commercial Education Children’s nursery or creche",
    display: "Children’s nursery or creche",
    colour: adsDarkBlue,
  },
  {
    id: "CE03",
    lookup: "Commercial Education Primary",
    display: "Primary",
    colour: adsDarkBlue,
  },
  {
    id: "CE04",
    lookup: "Commercial Education Secondary",
    display: "Secondary",
    colour: adsDarkBlue,
  },
  {
    id: "CE05",
    lookup: "Commercial Education University",
    display: "University",
    colour: adsDarkBlue,
  },
  {
    id: "CE06",
    lookup: "Commercial Education Special needs",
    display: "Special needs",
    colour: adsDarkBlue,
  },
  {
    id: "CE07",
    lookup: "Commercial Education Other establishments",
    display: "Other establishments",
    colour: adsDarkBlue,
  },
  {
    id: "CH",
    lookup: "Commercial Hotel, Motel, Boarding or Guest house",
    display: "Hotel, Motel, Boarding or Guest house",
    colour: adsDarkBlue,
  },
  {
    id: "CH01",
    lookup: "Commercial Hotel, Motel, Boarding or Guest house Boarding or Guest house, Bed & breakfast or Youth hostel",
    display: "Boarding or Guest house, Bed & breakfast or Youth hostel",
    colour: adsDarkBlue,
  },
  {
    id: "CH02",
    lookup: "Commercial Hotel, Motel, Boarding or Guest house Holiday Let or accommodation, other than CH01",
    display: "Holiday Let or accommodation, other than CH01",
    colour: adsDarkBlue,
  },
  {
    id: "CH03",
    lookup: "Commercial Hotel, Motel, Boarding or Guest house Hotel or Motel",
    display: "Hotel or Motel",
    colour: adsDarkBlue,
  },
  {
    id: "CI",
    lookup: "Commercial Industrial",
    display: "Industrial",
    colour: adsDarkBlue,
  },
  {
    id: "CI01",
    lookup: "Commercial Industrial Factory or manufacturing",
    display: "Factory or manufacturing",
    colour: adsDarkBlue,
  },
  {
    id: "CI02",
    lookup: "Commercial Industrial Mineral working",
    display: "Mineral working",
    colour: adsDarkBlue,
  },
  {
    id: "CI03",
    lookup: "Commercial Industrial Workshop or light industrial",
    display: "Workshop or light industrial",
    colour: adsDarkBlue,
  },
  {
    id: "CI04",
    lookup: "Commercial Industrial Warehouse or storage depot",
    display: "Warehouse or storage depot",
    colour: adsDarkBlue,
  },
  {
    id: "CI05",
    lookup: "Commercial Industrial Wholesale distribution",
    display: "Wholesale distribution",
    colour: adsDarkBlue,
  },
  {
    id: "CI06",
    lookup: "Commercial Industrial Recycling plant",
    display: "Recycling plant",
    colour: adsDarkBlue,
  },
  {
    id: "CI07",
    lookup: "Commercial Industrial Incinerator or waste transfer station",
    display: "Incinerator or waste transfer station",
    colour: adsDarkBlue,
  },
  {
    id: "CI08",
    lookup: "Commercial Industrial Maintenance depot",
    display: "Maintenance depot",
    colour: adsDarkBlue,
  },
  {
    id: "CL",
    lookup: "Commercial Leisure",
    display: "Leisure",
    colour: adsDarkBlue,
  },
  {
    id: "CL01",
    lookup: "Commercial Leisure Amusement",
    display: "Amusement",
    colour: adsDarkBlue,
  },
  {
    id: "CL02",
    lookup: "Commercial Leisure Holiday campsite",
    display: "Holiday campsite",
    colour: adsDarkBlue,
  },
  {
    id: "CL03",
    lookup: "Commercial Leisure Library",
    display: "Library",
    colour: adsDarkBlue,
  },
  {
    id: "CL04",
    lookup: "Commercial Leisure Museum or Gallery",
    display: "Museum or Gallery",
    colour: adsDarkBlue,
  },
  {
    id: "CL06",
    lookup: "Commercial Leisure Indoor or Outdoor leisure or sporting activity or centre",
    display: "Indoor or Outdoor leisure or sporting activity or centre",
    colour: adsDarkBlue,
  },
  {
    id: "CL07",
    lookup: "Commercial Leisure Bingo hall, Cinema, Conference or Exhibition centre, Theatre or Concert hall",
    display: "Bingo hall, Cinema, Conference or Exhibition centre, Theatre or Concert hall",
    colour: adsDarkBlue,
  },
  {
    id: "CL08",
    lookup: "Commercial Leisure Zoo or Theme park",
    display: "Zoo or Theme park",
    colour: adsDarkBlue,
  },
  {
    id: "CL09",
    lookup: "Commercial Leisure Beach hut",
    display: "Beach hut",
    colour: adsDarkBlue,
  },
  {
    id: "CL10",
    lookup: "Commercial Leisure Licensed private club",
    display: "Licensed private club",
    colour: adsDarkBlue,
  },
  {
    id: "CL11",
    lookup: "Commercial Leisure Arena or Stadium",
    display: "Arena or Stadium",
    colour: adsDarkBlue,
  },
  {
    id: "CM",
    lookup: "Commercial Medical",
    display: "Medical",
    colour: adsDarkBlue,
  },
  {
    id: "CM01",
    lookup: "Commercial Medical Dentist",
    display: "Dentist",
    colour: adsDarkBlue,
  },
  {
    id: "CM02",
    lookup: "Commercial Medical GP surgery or clinic",
    display: "GP surgery or clinic",
    colour: adsDarkBlue,
  },
  {
    id: "CM03",
    lookup: "Commercial Medical Hospital or hospice",
    display: "Hospital or hospice",
    colour: adsDarkBlue,
  },
  {
    id: "CM04",
    lookup: "Commercial Medical Laboratory",
    display: "Laboratory",
    colour: adsDarkBlue,
  },
  {
    id: "CM05",
    lookup: "Commercial Medical Professional services",
    display: "Professional services",
    colour: adsDarkBlue,
  },
  {
    id: "CM06",
    lookup: "Commercial Medical Pharmacy",
    display: "Pharmacy",
    colour: adsDarkBlue,
  },
  {
    id: "CN",
    lookup: "Commercial Animal centre",
    display: "Animal Centre",
    colour: adsDarkBlue,
  },
  {
    id: "CN01",
    lookup: "Commercial Animal centre Cattery or Kennel",
    display: "Cattery or Kennel",
    colour: adsDarkBlue,
  },
  {
    id: "CN02",
    lookup: "Commercial Animal centre Animal services",
    display: "Animal services",
    colour: adsDarkBlue,
  },
  {
    id: "CN03",
    lookup: "Commercial Animal centre Equestrian",
    display: "Equestrian",
    colour: adsDarkBlue,
  },
  {
    id: "CN04",
    lookup: "Commercial Animal centre Vet or Treatment centre",
    display: "Vet or Treatment centre",
    colour: adsDarkBlue,
  },
  {
    id: "CN05",
    lookup: "Commercial Animal centre Animal. Bird or marine sanctuary",
    display: "Animal. Bird or marine sanctuary",
    colour: adsDarkBlue,
  },
  {
    id: "CO",
    lookup: "Commercial Office",
    display: "Offices",
    colour: adsDarkBlue,
  },
  {
    id: "CO01",
    lookup: "Commercial Office Office or Work studio",
    display: "Office or Work studio",
    colour: adsDarkBlue,
  },
  {
    id: "CO02",
    lookup: "Commercial Office Broadcasting (TV or radio)",
    display: "Broadcasting (TV or radio)",
    colour: adsDarkBlue,
  },
  {
    id: "CR",
    lookup: "Commercial Retail",
    display: "Retail",
    colour: adsDarkBlue,
  },
  {
    id: "CR01",
    lookup: "Commercial Retail Bank or Financial services",
    display: "Bank or Financial services",
    colour: adsDarkBlue,
  },
  {
    id: "CR02",
    lookup: "Commercial Retail Retail",
    display: "Retail",
    colour: adsDarkBlue,
  },
  {
    id: "CR04",
    lookup: "Commercial Retail Market (indoor or outdoor)",
    display: "Market (indoor or outdoor)",
    colour: adsDarkBlue,
  },
  {
    id: "CR05",
    lookup: "Commercial Retail Petrol filling station",
    display: "Petrol filling station",
    colour: adsDarkBlue,
  },
  {
    id: "CR06",
    lookup: "Commercial Retail Public house, Bar of Nightclub",
    display: "Public house, Bar of Nightclub",
    colour: adsDarkBlue,
  },
  {
    id: "CR07",
    lookup: "Commercial Retail Restaurant or cafe",
    display: "Restaurant or cafe",
    colour: adsDarkBlue,
  },
  {
    id: "CR08",
    lookup: "Commercial Retail Shop or showroom",
    display: "Shop or showroom",
    colour: adsDarkBlue,
  },
  {
    id: "CR09",
    lookup: "Commercial Retail Other licensed premises",
    display: "Other licensed premises",
    colour: adsDarkBlue,
  },
  {
    id: "CR10",
    lookup: "Commercial Retail Fast food or takeaway",
    display: "Fast food or takeaway",
    colour: adsDarkBlue,
  },
  {
    id: "CR11",
    lookup: "Commercial Retail ATM",
    display: "ATM",
    colour: adsDarkBlue,
  },
  {
    id: "CS",
    lookup: "Commercial Storage land",
    display: "Storage land",
    colour: adsDarkBlue,
  },
  {
    id: "CS01",
    lookup: "Commercial Storage land General storage land",
    display: "General storage land",
    colour: adsDarkBlue,
  },
  {
    id: "CS02",
    lookup: "Commercial Storage land Builders' yard",
    display: "Builders' yard",
    colour: adsDarkBlue,
  },
  {
    id: "CT",
    lookup: "Commercial Transport",
    display: "Transport",
    colour: adsDarkBlue,
  },
  {
    id: "CT01",
    lookup: "Commercial Transport Airfield, Airstrip, Airport or other Air infrastructure",
    display: "Airfield, Airstrip, Airport or other Air infrastructure",
    colour: adsDarkBlue,
  },
  {
    id: "CT02",
    lookup: "Commercial Transport Bus shelter",
    display: "Bus shelter",
    colour: adsDarkBlue,
  },
  {
    id: "CT03",
    lookup: "Commercial Transport Car, Coach, Commercial vehicle or Taxi parking. Park and Ride",
    display: "Car, Coach, Commercial vehicle or Taxi parking. Park and Ride",
    colour: adsDarkBlue,
  },
  {
    id: "CT04",
    lookup: "Commercial Transport Goods or freight handling terminal",
    display: "Goods or freight handling terminal",
    colour: adsDarkBlue,
  },
  {
    id: "CT05",
    lookup: "Commercial Transport Marina",
    display: "Marina",
    colour: adsDarkBlue,
  },
  {
    id: "CT06",
    lookup: "Commercial Transport Mooring",
    display: "Mooring",
    colour: adsDarkBlue,
  },
  {
    id: "CT07",
    lookup: "Commercial Transport Railway asset",
    display: "Railway asset",
    colour: adsDarkBlue,
  },
  {
    id: "CT08",
    lookup: "Commercial Transport Station, Interchange, Terminal or Halt",
    display: "Station, Interchange, Terminal or Halt",
    colour: adsDarkBlue,
  },
  {
    id: "CT09",
    lookup: "Commercial Transport Transport track or way",
    display: "Transport track or way",
    colour: adsDarkBlue,
  },
  {
    id: "CT10",
    lookup: "Commercial Transport Vehicle storage",
    display: "Vehicle storage",
    colour: adsDarkBlue,
  },
  {
    id: "CT11",
    lookup: "Commercial Transport Transport related infrastructure",
    display: "Transport related infrastructure",
    colour: adsDarkBlue,
  },
  {
    id: "CT12",
    lookup: "Commercial Transport Overnight lorry park",
    display: "Overnight lorry park",
    colour: adsDarkBlue,
  },
  {
    id: "CT13",
    lookup: "Commercial Transport Harbour, Port, Dockyard, Slipway, Landing stage, Pier, Jetty, Pontoon or Quay",
    display: "Harbour, Port, Dockyard, Slipway, Landing stage, Pier, Jetty, Pontoon or Quay",
    colour: adsDarkBlue,
  },
  {
    id: "CU",
    lookup: "Commercial Utility",
    display: "Utility",
    colour: adsDarkBlue,
  },
  {
    id: "CU01",
    lookup: "Commercial Utility Electricity sub station",
    display: "Electricity sub station",
    colour: adsDarkBlue,
  },
  {
    id: "CU02",
    lookup: "Commercial Utility Landfill",
    display: "Landfill",
    colour: adsDarkBlue,
  },
  {
    id: "CU03",
    lookup: "Commercial Utility Power station or Energy production",
    display: "Power station or Energy production",
    colour: adsDarkBlue,
  },
  {
    id: "CU04",
    lookup: "Commercial Utility Water tower, Pump house or Water tower",
    display: "Water tower, Pump house or Water tower",
    colour: adsDarkBlue,
  },
  {
    id: "CU06",
    lookup: "Commercial Utility Telecommunication",
    display: "Telecommunication",
    colour: adsDarkBlue,
  },
  {
    id: "CU07",
    lookup: "Commercial Utility Water, Waste water or Sewage treatment works",
    display: "Water, Waste water or Sewage treatment works",
    colour: adsDarkBlue,
  },
  {
    id: "CU08",
    lookup: "Commercial Utility Gas or Oil distribution",
    display: "Gas or Oil distribution",
    colour: adsDarkBlue,
  },
  {
    id: "CU09",
    lookup: "Commercial Utility Other utility use",
    display: "Other utility use",
    colour: adsDarkBlue,
  },
  {
    id: "CU10",
    lookup: "Commercial Utility Waste management",
    display: "Waste management",
    colour: adsDarkBlue,
  },
  {
    id: "CU11",
    lookup: "Commercial Utility Telephone box",
    display: "Telephone box",
    colour: adsDarkBlue,
  },
  {
    id: "CU12",
    lookup: "Commercial Utility Dam",
    display: "Dam",
    colour: adsDarkBlue,
  },
  {
    id: "CX",
    lookup: "Commercial Emergency Services",
    display: "Emergency Services",
    colour: adsDarkBlue,
  },
  {
    id: "CX01",
    lookup: "Commercial Emergency Services Police Station",
    display: "Police Station",
    colour: adsDarkBlue,
  },
  {
    id: "CX02",
    lookup: "Commercial Emergency Services Fire Station",
    display: "Fire Station",
    colour: adsDarkBlue,
  },
  {
    id: "CX03",
    lookup: "Commercial Emergency Services Ambulance Station",
    display: "Ambulance Station",
    colour: adsDarkBlue,
  },
  {
    id: "CX04",
    lookup: "Commercial Emergency Services Lifeboat services station",
    display: "Lifeboat services station",
    colour: adsDarkBlue,
  },
  {
    id: "CX05",
    lookup: "Commercial Emergency Services Coastguard rescue or Lookout station",
    display: "Coastguard rescue or Lookout station",
    colour: adsDarkBlue,
  },
  {
    id: "CX06",
    lookup: "Commercial Emergency Services Mountain rescue station",
    display: "Mountain rescue station",
    colour: adsDarkBlue,
  },
  {
    id: "CX07",
    lookup: "Commercial Emergency Services Lighthouse",
    display: "Lighthouse",
    colour: adsDarkBlue,
  },
  {
    id: "CX08",
    lookup: "Commercial Emergency Services Police box or kiosk",
    display: "Police box or kiosk",
    colour: adsDarkBlue,
  },
  {
    id: "CZ",
    lookup: "Commercial Information",
    display: "Information",
    colour: adsDarkBlue,
  },
  {
    id: "CZ01",
    lookup: "Commercial Information Advertising hoarding",
    display: "Advertising hoarding",
    colour: adsDarkBlue,
  },
  {
    id: "CZ02",
    lookup: "Commercial Information Tourist information signage",
    display: "Tourist information signage",
    colour: adsDarkBlue,
  },
  {
    id: "CZ03",
    lookup: "Commercial Information Traffic information signage",
    display: "Traffic information signage",
    colour: adsDarkBlue,
  },
  {
    id: "L",
    lookup: "Land",
    display: "Land",
    colour: adsDarkBlue,
  },
  {
    id: "LA",
    lookup: "Land Agricultural",
    display: "Land Agricultural",
    colour: adsDarkBlue,
  },
  {
    id: "LA01",
    lookup: "Land Agricultural Grazing land",
    display: "Grazing land",
    colour: adsDarkBlue,
  },
  {
    id: "LA02",
    lookup: "Land Agricultural Permanent crop rotation",
    display: "Permanent crop rotation",
    colour: adsDarkBlue,
  },
  {
    id: "LB",
    lookup: "Land Ancillary building",
    display: "Land Ancillary building",
    colour: adsDarkBlue,
  },
  {
    id: "LC",
    lookup: "Land Burial Ground",
    display: "Burial Ground",
    colour: adsDarkBlue,
  },
  {
    id: "LC01",
    lookup: "Land Burial Ground Historic cemetery or graveyard",
    display: "Historic cemetery or graveyard",
    colour: adsDarkBlue,
  },
  {
    id: "LD",
    lookup: "Land Development",
    display: "Development",
    colour: adsDarkBlue,
  },
  {
    id: "LD01",
    lookup: "Land Development Development site",
    display: "Development site",
    colour: adsDarkBlue,
  },
  {
    id: "LF",
    lookup: "Land Forestry",
    display: "Forestry",
    colour: adsDarkBlue,
  },
  {
    id: "LF02",
    lookup: "Land Forestry Forest, Arboretum or Pinetum (managed or unmanaged)",
    display: "Forest, Arboretum or Pinetum (managed or unmanaged)",
    colour: adsDarkBlue,
  },
  {
    id: "LF03",
    lookup: "Land Forestry Woodland",
    display: "Woodland",
    colour: adsDarkBlue,
  },
  {
    id: "LL",
    lookup: "Land Allotment",
    display: "Allotment",
    colour: adsDarkBlue,
  },
  {
    id: "LM",
    lookup: "Land Amenity",
    display: "Amenity",
    colour: adsDarkBlue,
  },
  {
    id: "LM01",
    lookup: "Land Amenity Landscaped Roundabout",
    display: "Landscaped Roundabout",
    colour: adsDarkBlue,
  },
  {
    id: "LM02",
    lookup: "Land Amenity Verge or central reservation",
    display: "Verge or central reservation",
    colour: adsDarkBlue,
  },
  {
    id: "LM03",
    lookup: "Land Amenity Maintained amenity land",
    display: "Maintained amenity land",
    colour: adsDarkBlue,
  },
  {
    id: "LM04",
    lookup: "Land Amenity Maintained surface areas",
    display: "Maintained surface areas",
    colour: adsDarkBlue,
  },
  {
    id: "LO",
    lookup: "Land Open space",
    display: "Open space",
    colour: adsDarkBlue,
  },
  {
    id: "LO01",
    lookup: "Land Open space Heath or Moorland",
    display: "Heath or Moorland",
    colour: adsDarkBlue,
  },
  {
    id: "LP",
    lookup: "Land Park",
    display: "Park",
    colour: adsDarkBlue,
  },
  {
    id: "LP01",
    lookup: "Land Park Public park or garden",
    display: "Public park or garden",
    colour: adsDarkBlue,
  },
  {
    id: "LP02",
    lookup: "Land Park Public open space or Nature reserve",
    display: "Public open space or Nature reserve",
    colour: adsDarkBlue,
  },
  {
    id: "LP03",
    lookup: "Land Park Playground",
    display: "Playground",
    colour: adsDarkBlue,
  },
  {
    id: "LP04",
    lookup: "Land Park Private park or garden",
    display: "Private park or garden",
    colour: adsDarkBlue,
  },
  {
    id: "LU",
    lookup: "Land Unused",
    display: "Unused",
    colour: adsDarkBlue,
  },
  {
    id: "LU01",
    lookup: "Land Unused Vacant or derelict",
    display: "Vacant or derelict",
    colour: adsDarkBlue,
  },
  {
    id: "LW",
    lookup: "Land Water",
    display: "Water",
    colour: adsDarkBlue,
  },
  {
    id: "LW01",
    lookup: "Land Water Lake",
    display: "Lake",
    colour: adsDarkBlue,
  },
  {
    id: "LW02",
    lookup: "Land Water Named pond",
    display: "Named pond",
    colour: adsDarkBlue,
  },
  {
    id: "LW03",
    lookup: "Land Water Waterway",
    display: "Waterway",
    colour: adsDarkBlue,
  },
  {
    id: "M",
    lookup: "Military",
    display: "Military",
    colour: adsDarkBlue,
  },
  {
    id: "MA",
    lookup: "Military Army",
    display: "Army",
    colour: adsDarkBlue,
  },
  {
    id: "MB",
    lookup: "Military Ancillary building",
    display: "Military Ancillary building",
    colour: adsDarkBlue,
  },
  {
    id: "MF",
    lookup: "Military Air Force",
    display: "Air Force",
    colour: adsDarkBlue,
  },
  {
    id: "MG",
    lookup: "Military Defence Estates",
    display: "Defence Estates",
    colour: adsDarkBlue,
  },
  {
    id: "MN",
    lookup: "Military Navy",
    display: "Navy",
    colour: adsDarkBlue,
  },
  {
    id: "P",
    lookup: "Parent shell",
    display: "Parent shell",
    colour: adsDarkBlue,
  },
  {
    id: "PP",
    lookup: "Parent shell Property shell",
    display: "Property shell",
    colour: adsDarkBlue,
  },
  {
    id: "PS",
    lookup: "Parent shell Street record",
    display: "Street record",
    colour: adsDarkBlue,
  },
  {
    id: "R",
    lookup: "Residential",
    display: "Residential",
    colour: adsDarkBlue,
  },
  {
    id: "RB",
    lookup: "Residential Ancillary building",
    display: "Residential Ancillary building",
    colour: adsDarkBlue,
  },
  {
    id: "RC",
    lookup: "Residential Car parking space",
    display: "Car parking space",
    colour: adsDarkBlue,
  },
  {
    id: "RC01",
    lookup: "Residential Car parking space Allocated parking",
    display: "Allocated parking",
    colour: adsDarkBlue,
  },
  {
    id: "RD",
    lookup: "Residential Dwelling",
    display: "Dwelling",
    colour: adsDarkBlue,
  },
  {
    id: "RD01",
    lookup: "Residential Dwelling Caravan",
    display: "Caravan",
    colour: adsDarkBlue,
  },
  {
    id: "RD02",
    lookup: "Residential Dwelling Detached",
    display: "Detached",
    colour: adsDarkBlue,
  },
  {
    id: "RD03",
    lookup: "Residential Dwelling Semi detached",
    display: "Semi detached",
    colour: adsDarkBlue,
  },
  {
    id: "RD04",
    lookup: "Residential Dwelling Terrace (includes end of terrace)",
    display: "Terrace (includes end of terrace)",
    colour: adsDarkBlue,
  },
  {
    id: "RD06",
    lookup: "Residential Dwelling Self-contained flat",
    display: "Self-contained flat",
    colour: adsDarkBlue,
  },
  {
    id: "RD07",
    lookup: "Residential Dwelling House boat",
    display: "House boat",
    colour: adsDarkBlue,
  },
  {
    id: "RD08",
    lookup: "Residential Dwelling Sheltered accommodation",
    display: "Sheltered accommodation",
    colour: adsDarkBlue,
  },
  {
    id: "RD10",
    lookup: "Residential Dwelling Privately owned holiday caravan or chalet",
    display: "Privately owned holiday caravan or chalet",
    colour: adsDarkBlue,
  },
  {
    id: "RG",
    lookup: "Residential Garage",
    display: "Garage",
    colour: adsDarkBlue,
  },
  {
    id: "RG02",
    lookup: "Residential Garage Lockup garage or Garage court",
    display: "Lockup garage or Garage court",
    colour: adsDarkBlue,
  },
  {
    id: "RH",
    lookup: "Residential House in multiple occupation",
    display: "House in multiple occupation",
    colour: adsDarkBlue,
  },
  {
    id: "RH01",
    lookup: "Residential House in multiple occupation HMO parent",
    display: "HMO parent",
    colour: adsDarkBlue,
  },
  {
    id: "RH02",
    lookup: "Residential House in multiple occupation HMO bedsit or other non self-contained unit",
    display: "HMO bedsit or other non self-contained unit",
    colour: adsDarkBlue,
  },
  {
    id: "RH03",
    lookup: "Residential House in multiple occupation HMO not further divided",
    display: "HMO not further divided",
    colour: adsDarkBlue,
  },
  {
    id: "RI",
    lookup: "Residential Residential Institution",
    display: "Residential Institution",
    colour: adsDarkBlue,
  },
  {
    id: "RI01",
    lookup: "Residential Residential Institution Care or Nursing home",
    display: "Care or Nursing home",
    colour: adsDarkBlue,
  },
  {
    id: "RI02",
    lookup: "Residential Residential Institution Communal residence",
    display: "Communal residence",
    colour: adsDarkBlue,
  },
  {
    id: "RI03",
    lookup: "Residential Residential Institution Residential education",
    display: "Residential education",
    colour: adsDarkBlue,
  },
  {
    id: "U",
    lookup: "Unclassified",
    display: "Unclassified",
    colour: adsDarkBlue,
  },
  {
    id: "UC",
    lookup: "Unclassified Awaiting classification",
    display: "Awaiting classification",
    colour: adsDarkBlue,
  },
  {
    id: "UP",
    lookup: "Unclassified Pending internal investigation",
    display: "Pending internal investigation",
    colour: adsDarkBlue,
  },
  {
    id: "Z",
    lookup: "Object of interest",
    display: "Object of interest",
    colour: adsDarkBlue,
  },
  {
    id: "ZA",
    lookup: "Object of interest Archaeological dig site",
    display: "Archaeological dig site",
    colour: adsDarkBlue,
  },
  {
    id: "ZB",
    lookup: "Object of interest Bothy",
    display: "Bothy",
    colour: adsDarkBlue,
  },
  {
    id: "ZM",
    lookup: "Object of interest Monument",
    display: "Monument",
    colour: adsDarkBlue,
  },
  {
    id: "ZM01",
    lookup: "Object of interest Monument Obelisk, Milestone or Standing stone",
    display: "Obelisk, Milestone or Standing stone",
    colour: adsDarkBlue,
  },
  {
    id: "ZM02",
    lookup: "Object of interest Monument Memorial or Market cross",
    display: "Memorial or Market cross",
    colour: adsDarkBlue,
  },
  {
    id: "ZM03",
    lookup: "Object of interest Monument Statue",
    display: "Statue",
    colour: adsDarkBlue,
  },
  {
    id: "ZM04",
    lookup: "Object of interest Monument Castle or historic ruin",
    display: "Castle or historic ruin",
    colour: adsDarkBlue,
  },
  {
    id: "ZM05",
    lookup: "Object of interest Monument Other structure",
    display: "Other structure",
    colour: adsDarkBlue,
  },
  {
    id: "ZS",
    lookup: "Object of interest Stately home",
    display: "Stately home",
    colour: adsDarkBlue,
  },
  {
    id: "ZU",
    lookup: "Object of interest Underground feature",
    display: "Underground feature",
    colour: adsDarkBlue,
  },
  {
    id: "ZU01",
    lookup: "Object of interest Underground feature Cave",
    display: "Cave",
    colour: adsDarkBlue,
  },
  {
    id: "ZU04",
    lookup: "Object of interest Underground feature Pothole or natural hole",
    display: "Pothole or natural hole",
    colour: adsDarkBlue,
  },
  {
    id: "ZV",
    lookup: "Object of interest Other underground feature",
    display: "Other underground feature",
    colour: adsDarkBlue,
  },
  {
    id: "ZV01",
    lookup: "Object of interest Other underground feature Cellar",
    display: "Cellar",
    colour: adsDarkBlue,
  },
  {
    id: "ZV02",
    lookup: "Object of interest Other underground feature Disused mine",
    display: "Disused mine",
    colour: adsDarkBlue,
  },
  {
    id: "ZV03",
    lookup: "Object of interest Other underground feature Well or spring",
    display: "Well or spring",
    colour: adsDarkBlue,
  },
  {
    id: "ZW",
    lookup: "Object of interest Place of worship",
    display: "Place of worship",
    colour: adsDarkBlue,
  },
];

export default OSGClassification;
