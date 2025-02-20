//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Latest Edits control for homepage
//
//  Copyright:    © 2021 - 2025 Idox Software Limited
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001   02.06.23 Joel Benford        WI40689 Initial Revision.
//    002          ? Sean Flook                  Various layout changes
//    003   05.07.23 Joel Benford        WI40762 Add lastUser to latest edits grid
//    004   24.07.23 Sean Flook                  Corrected spelling mistake.
//    005   07.09.23 Sean Flook                  Removed unnecessary code.
//    006   06.10.23 Sean Flook                  Use colour variables and added some error trapping.
//    007   10.11.23 Sean Flook                  Removed HasASDPlus as no longer required and corrected display of user avatar.
//    008   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and removed a couple of warnings.
//    009   08.12.23 Sean Flook                  Migrated DataGrid to v6.
//    010   05.01.24 Sean Flook                  Changes to sort out warnings.
//    011   26.01.24 Sean Flook        IMANN-260 Corrected field name.
//    012   02.02.24 Joel Benford                Styling changes on tabs/grid
//    013   09.02.24 Sean Flook                  Modified handleHistoricPropertyClose to handle returning an action from the historic property warning dialog.
//    014   13.02.24 Sean Flook                  Corrected the type 66 map data.
//    015   14.02.24 Sean Flook                  Added a bit of error trapping.
//    016   07.03.24 Joshua McCormick   IMANN-280 Added tabContainerStyle to tab container
//    017   11.03.24 Sean Flook            GLB12 Adjusted height to remove gap.
//    018   18.03.24 Sean Flook       STRFRM3_OS Set the styling for the header row of the data grid.
//    019   22.03.24 Sean Flook            GLB12 Changed to use dataFormStyle so height can be correctly set.
//    020   04.04.24 Sean Flook                  Added parentUprn to mapContext search data for properties.
//    021   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    022   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    023   04.07.24 Sean Flook        IMANN-705 Use displayName if lastUser is the same as auditName.
//    024   04.07.24 Sean Flook        IMANN-705 Also change tooltip.
//    025   18.07.24 Sean Flook        IMANN-772 Corrected field name.
//    026   28.08.24 Sean Flook        IMANN-957 Added missing formattedAddress field to map search data.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    027   03.10.24 Sean Flook       IMANN-1001 Use getClassificationCode to determine the classification code to use.
//    028   14.10.24 Sean Flook       IMANN-1016 Changes required to handle LLPG Streets.
//endregion Version 1.0.1.0
//region Version 1.0.2.0
//    029   14.10.24 Sean Flook       IMANN-1100 Call onEditMapObject when opening a property.
//endregion Version 1.0.2.0
//region Version 1.0.3.0
//    030   09.01.25 Sean Flook        IMANN-781 Call onMapChange when opening a property.
//endregion Version 1.0.3.0
//region Version 1.0.5.0
//    031   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import { React, useContext, useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";
import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import MapContext from "../context/mapContext";

import { GetStreetMapData, streetToTitleCase } from "../utils/StreetUtils";
import { GetPropertyMapData, addressToTitleCase, getClassificationCode } from "../utils/PropertyUtils";
import { GetWktCoordinates, FormatDate, StringAvatar } from "../utils/HelperUtils";

import HistoricPropertyDialog from "../dialogs/HistoricPropertyDialog";
import { AppBar, Tabs, Tab, Typography, Avatar, Tooltip } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { DataGrid } from "@mui/x-data-grid";

import { adsBlueA, adsWhite } from "../utils/ADSColours";
import {
  gridRowStyle,
  tabContainerStyle,
  tabStyle,
  tabLabelStyle,
  tooltipStyle,
  dataFormStyle,
} from "../utils/ADSStyles";
import { createTheme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`homepage-tabpanel-${index}`}
      aria-labelledby={`homepage-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `homepage-tab-${index}`,
    "aria-controls": `homepage-tabpanel-${index}`,
  };
}

const defaultTheme = createTheme();
const useStyles = makeStyles(
  (theme) => {
    return gridRowStyle;
  },
  { defaultTheme }
);

function ADSHomepageLatestEditsControl({ data }) {
  const classes = useStyles();

  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);
  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const mapContext = useContext(MapContext);

  const [value, setValue] = useState(1);
  const [openHistoricProperty, setOpenHistoricProperty] = useState(false);
  const [hasASD, setHasASD] = useState(false);

  const historicRec = useRef(null);

  /**
   * Method to format the address to title case.
   *
   * @param {string} address The address to set the case for.
   * @returns {string} The address in title case.
   */
  const casedAddress = (address) => {
    const lastPart = address.split(", ").reverse()[0];
    const regexp = /^[A-Z]{1,2}[0-9RCHNQ][0-9A-Z]?\s?[0-9][ABD-HJLNP-UW-Z]{2}$|^[A-Z]{2}-?[0-9]{4}$/;
    const postcode = regexp.test(lastPart) ? lastPart : "";
    return addressToTitleCase(address, postcode);
  };

  /**
   * Method to get the last users avatar.
   *
   * @param {string} lastUser The name of the last user.
   * @returns {JSX.Element} The avatar for the last user.
   */
  const lastEditAvatar = (lastUser) => {
    return (
      <Tooltip
        title={lastUser === userContext.currentUser.auditName ? userContext.currentUser.displayName : lastUser}
        sx={tooltipStyle}
      >
        <Avatar
          {...StringAvatar(
            lastUser === userContext.currentUser.auditName ? userContext.currentUser.displayName : lastUser,
            true
          )}
        />
      </Tooltip>
    );
  };

  /**
   * Method to render the contents of the last edit cell in the grid.
   *
   * @param {object} params The parameters object
   * @returns {JSX.Element} The contents of the last edit cell in the grid.
   */
  const renderLastEditCell = (params) => {
    return (
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{FormatDate(params.row.lastUpdated)}</Typography>
        {lastEditAvatar(params.row.lastUser || "Undefined Last User")}
      </Stack>
    );
  };

  const columns = [
    { field: "uprn" },
    { field: "usrn" },
    {
      field: "displayId",
      headerClassName: "idox-homepage-latest-edits-data-grid-header",
      headerName: "Reference",
      flex: 15,
    },
    {
      field: "displayText",
      headerClassName: "idox-homepage-latest-edits-data-grid-header",
      headerName: "Description",
      flex: 70,
      valueGetter: (value, row, column, apiRef) => (row.usrn ? streetToTitleCase(value) : casedAddress(value)),
    },
    {
      field: "latestEdit",
      headerClassName: "idox-homepage-latest-edits-data-grid-header",
      headerName: "Last edited",
      display: "flex",
      flex: 15,
      renderCell: renderLastEditCell,
      align: "right",
      headerAlign: "right",
    },
  ];

  /**
   * Event to handle when a user changes tabs on the form
   *
   * @param {object} event - the event object.
   * @param {number} newValue - The index of the tab the user wants to switch to.
   */
  const handleTabChange = (event, newValue) => {
    // setValue(newValue);
    // At the moment do not allow the user to change tabs
    setValue(1);
  };

  /**
   * Event to handle editing a street.
   *
   * @param {number} usrn The USRN of the street to be edited.
   * @param {string} description The description for the street to be edited.
   */
  const doEditStreet = async (usrn, description) => {
    // show the street tab
    streetContext.onStreetChange(usrn, description, false);

    const foundStreet = // do we have right bit of map loaded already?
      MapContext.currentLayers &&
      MapContext.currentSearchData.streets &&
      MapContext.currentSearchData.streets.find(({ usrn }) => usrn.toString() === usrn);

    if (foundStreet) {
      //if so tell map to reuse it
      mapContext.onSearchDataChange(
        mapContext.currentSearchData.streets,
        mapContext.currentSearchData.llpgStreets,
        mapContext.currentSearchData.properties,
        usrn,
        null
      );
    } else {
      //else fetch what we need and pass to map
      const streetData = await GetStreetMapData(usrn, userContext, settingsContext.isScottish);
      const esus = streetData
        ? userContext.currentUser.hasStreet
          ? streetData.esus.map((rec) => ({
              esuId: rec.esuId,
              geometry: rec.wktGeometry && rec.wktGeometry !== "" ? GetWktCoordinates(rec.wktGeometry) : undefined,
            }))
          : [
              {
                esuId: -1,
                state: undefined,
                geometry: GetWktCoordinates(
                  `LINESTRING (${streetData.streetStartX} ${streetData.streetStartY}, ${streetData.streetEndX} ${streetData.streetEndY})`
                ),
              },
            ]
        : [];
      const engDescriptor = streetData.streetDescriptors.filter((sd) => sd.language === "ENG")[0];
      const asdType51 =
        userContext.currentUser.hasStreet &&
        settingsContext.isScottish &&
        streetData &&
        streetData.maintenanceResponsibilities
          ? streetData.maintenanceResponsibilities.map((asdRec) => ({
              type: 51,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              streetStatus: asdRec.streetStatus,
              custodianCode: asdRec.custodianCode,
              maintainingAuthorityCode: asdRec.maintainingAuthorityCode,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType52 =
        userContext.currentUser.hasStreet &&
        settingsContext.isScottish &&
        streetData &&
        streetData.reinstatementCategories
          ? streetData.reinstatementCategories.map((asdRec) => ({
              type: 52,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              reinstatementCategoryCode: asdRec.reinstatementCategoryCode,
              custodianCode: asdRec.custodianCode,
              reinstatementAuthorityCode: asdRec.reinstatementAuthorityCode,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType53 =
        userContext.currentUser.hasStreet && settingsContext.isScottish && streetData && streetData.specialDesignations
          ? streetData.specialDesignations.map((asdRec) => ({
              type: 53,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              specialDesignationCode: asdRec.specialDesignationCode,
              custodianCode: asdRec.custodianCode,
              authorityCode: asdRec.authorityCode,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType61 =
        userContext.currentUser.hasStreet && !settingsContext.isScottish && hasASD && streetData && streetData.interests
          ? streetData.interests.map((asdRec) => ({
              type: 61,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              streetStatus: asdRec.streetStatus,
              interestType: asdRec.interestType,
              districtRefAuthority: asdRec.districtRefAuthority,
              swaOrgRefAuthority: asdRec.swaOrgRefAuthority,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType62 =
        userContext.currentUser.hasStreet &&
        !settingsContext.isScottish &&
        hasASD &&
        streetData &&
        streetData.constructions
          ? streetData.constructions.map((asdRec) => ({
              type: 62,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              constructionType: asdRec.constructionType,
              reinstatementTypeCode: asdRec.reinstatementTypeCode,
              swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
              districtRefConsultant: asdRec.districtRefConsultant,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType63 =
        userContext.currentUser.hasStreet &&
        !settingsContext.isScottish &&
        hasASD &&
        streetData &&
        streetData.specialDesignations
          ? streetData.specialDesignations.map((asdRec) => ({
              type: 63,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              streetSpecialDesigCode: asdRec.streetSpecialDesigCode,
              swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
              districtRefConsultant: asdRec.districtRefConsultant,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType64 =
        userContext.currentUser.hasStreet &&
        !settingsContext.isScottish &&
        hasASD &&
        streetData &&
        streetData.heightWidthWeights
          ? streetData.heightWidthWeights.map((asdRec) => ({
              type: 64,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              hwwRestrictionCode: asdRec.hwwRestrictionCode,
              swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
              districtRefConsultant: asdRec.districtRefConsultant,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType66 =
        userContext.currentUser.hasStreet &&
        !settingsContext.isScottish &&
        hasASD &&
        streetData &&
        streetData.publicRightOfWays
          ? streetData.publicRightOfWays.map((asdRec) => ({
              type: 66,
              pkId: asdRec.pkId,
              prowUsrn: asdRec.prowUsrn,
              prowRights: asdRec.prowRights,
              prowStatus: asdRec.prowStatus,
              prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
              prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
              defMapGeometryType: asdRec.defMapGeometryType,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const searchStreets = [
        {
          usrn: usrn,
          description: description,
          language: "ENG",
          locality: engDescriptor.locality,
          town: engDescriptor.town,
          state: streetData ? streetData.state : undefined,
          type: streetData ? streetData.recordType : undefined,
          esus: esus,
          asdType51: asdType51,
          asdType52: asdType52,
          asdType53: asdType53,
          asdType61: asdType61,
          asdType62: asdType62,
          asdType63: asdType63,
          asdType64: asdType64,
          asdType66: asdType66,
        },
      ];
      mapContext.onSearchDataChange(
        userContext.currentUser.hasStreet ? searchStreets : [],
        !userContext.currentUser.hasStreet ? searchStreets : [],
        [],
        usrn,
        null
      );
    }
  };

  /**
   * Event to handle editing a property.
   *
   * @param {number} uprn The UPRN of the property to be edited.
   * @param {number} parentUprn The UPRN of the parent property of the property to be edited.
   * @param {string} address The address of the property to be edited.
   * @param {string} postcode The postcode of the property to be edited.
   * @param {number} easting The easting of the property to be edited.
   * @param {number} northing The northing of the property to be edited.
   * @param {number} logicalStatus The logical status of the property to be edited.
   * @param {string} classificationCode The classification code of the property to be edited.
   */
  const doEditProperty = async (
    uprn,
    parentUprn,
    address,
    postcode,
    easting,
    northing,
    logicalStatus,
    classificationCode
  ) => {
    propertyContext.onPropertyChange(uprn, 0, address, address, postcode, null, null, false, null);

    const foundProperty = mapContext.currentSearchData.properties.find((x) => x.uprn === uprn.toString());
    if (foundProperty) {
      mapContext.onSearchDataChange(
        mapContext.currentSearchData.streets,
        mapContext.currentSearchData.llpgStreets,
        mapContext.currentSearchData.properties,
        null,
        uprn
      );
    } else {
      const propertyData = await GetPropertyMapData(uprn, userContext);
      const extents = propertyData
        ? propertyData.blpuProvenances.map((provRec) => ({
            pkId: provRec.pkId,
            uprn: uprn,
            code: provRec.provenanceCode,
            geometry:
              provRec.wktGeometry && provRec.wktGeometry !== "" ? GetWktCoordinates(provRec.wktGeometry) : undefined,
          }))
        : undefined;

      const searchProperties = [
        {
          uprn: uprn,
          parentUprn: parentUprn,
          address: address,
          formattedAddress: address,
          postcode: postcode,
          easting: easting,
          northing: northing,
          logicalStatus: logicalStatus,
          classificationCode: classificationCode ? classificationCode.substring(0, 1) : "U",
        },
      ];
      mapContext.onSearchDataChange([], [], searchProperties, null, uprn);
      mapContext.onMapChange(extents, null, null);
    }
    mapContext.onEditMapObject(21, uprn);
    mapContext.onHighlightStreetProperty(null, [uprn.toString()]);
  };

  /**
   * Method called when a property is to be edited.
   *
   * @param {number} uprn The UPRN of the property to be edited.
   */
  const EditProperty = async (uprn) => {
    // fetch data we will need
    const propertyData = await GetPropertyMapData(uprn, userContext, settingsContext.isScottish);
    const lpi = propertyData.lpis
      .filter((l) => l.language === "ENG")
      .sort((a, b) => a.logicalStatus - b.logicalStatus)[0];
    if (lpi.logicalStatus && lpi.logicalStatus === 8) {
      historicRec.current = {
        uprn: uprn,
        parentUprn: propertyData.parentUprn,
        address: lpi.address,
        postcode: lpi.postcode,
        easting: propertyData.xcoordinate,
        northing: propertyData.ycoordinate,
        logicalStatus: lpi.logicalStatus,
        classificationCode: getClassificationCode(propertyData),
      };
      setOpenHistoricProperty(true);
    } else
      doEditProperty(
        uprn,
        propertyData.parentUprn,
        lpi.address,
        lpi.postcode,
        propertyData.xcoordinate,
        propertyData.ycoordinate,
        lpi.logicalStatus,
        getClassificationCode(propertyData)
      );
  };

  /**
   * Event to handle closing a historic property.
   *
   * @param {string} action The action taken from the dialog
   */
  const handleHistoricPropertyClose = (action) => {
    setOpenHistoricProperty(false);
    if (action === "continue") {
      if (historicRec.current) {
        doEditProperty(
          historicRec.current.uprn,
          historicRec.current.parentUprn,
          historicRec.current.address,
          historicRec.current.postcode,
          historicRec.current.easting,
          historicRec.current.northing,
          historicRec.current.logicalStatus,
          historicRec.current.classificationCode
        );
      }
    }
  };

  /**
   * Event to handle when a row is clicked.
   *
   * @param {object} params The parameters object
   * @param {object} e The event object
   * @param {object} details The details object
   */
  const handleRowClick = async (params, e, details) => {
    e.preventDefault();
    if (params.row.usrn) await doEditStreet(params.row.usrn, params.row.displayText);
    else await EditProperty(params.row.uprn);
  };

  useEffect(() => {
    setHasASD(userContext.currentUser && userContext.currentUser.hasASD);
  }, [userContext]);

  return (
    <Box
      id="home-page-tables"
      sx={{
        width: "92vw",
      }}
    >
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleTabChange}
          TabIndicatorProps={{
            style: { background: adsBlueA, height: "2px" },
          }}
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          selectionFollowsFocus
          aria-label="home-page-tabs"
          sx={tabContainerStyle}
        >
          {process.env.NODE_ENV === "development" && (
            <Tab
              sx={tabStyle}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 0)}>
                    Edits in progress
                  </Typography>
                </Stack>
              }
              {...a11yProps(0)}
            />
          )}
          <Tab
            sx={tabStyle}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="subtitle2" sx={tabLabelStyle(value === 1)}>
                  Last updated
                </Typography>
              </Stack>
            }
            {...a11yProps(1)}
          />
          {process.env.NODE_ENV === "development" && (
            <Tab
              sx={tabStyle}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 2)}>
                    Viewed recently
                  </Typography>
                </Stack>
              }
              {...a11yProps(2)}
            />
          )}
          {process.env.NODE_ENV === "development" && (
            <Tab
              sx={tabStyle}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 3)}>
                    Received recently
                  </Typography>
                </Stack>
              }
              {...a11yProps(3)}
            />
          )}
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <Typography variant="body1" sx={{ pt: "4px" }}>
          No edits in progress
        </Typography>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box sx={dataFormStyle("ADSHomepageLatestEditsControl")} className={classes.root}>
          <DataGrid
            getRowClassName={(params) => "valid-row"}
            getRowId={(row) => row.uprn + "_" + row.usrn}
            sx={{ backgroundColor: adsWhite }}
            rows={data}
            columns={columns}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  uprn: false,
                  usrn: false,
                },
              },
              density: "compact",
            }}
            editMode="row"
            autoPageSize
            hideFooterSelectedRowCount
            showColumnVerticalBorder={false}
            isRowSelectable={(params) => false}
            onRowClick={handleRowClick}
          />
        </Box>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Typography variant="body1" sx={{ pt: "4px" }}>
          No records viewed recently
        </Typography>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Typography variant="body1" sx={{ pt: "4px" }}>
          No records received recently
        </Typography>
      </TabPanel>
      <HistoricPropertyDialog open={openHistoricProperty} onClose={handleHistoricPropertyClose} />
    </Box>
  );
}

export default ADSHomepageLatestEditsControl;
