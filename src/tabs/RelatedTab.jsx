//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Related tab
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001            Sean Flook                  Initial Revision.
//    002   23.03.23 Sean Flook          WI40604 Call reset when opening a new record.
//    003   05.04.23 Sean Flook          WI40596 If opening an historic property display the warning dialog.
//    004   28.06.23 Sean Flook          WI40256 Changed Extent to Provenance where appropriate.
//    005   07.09.23 Sean Flook                  Cleaned the code.
//    006   06.10.23 Sean Flook                  Added some error trapping.
//    006   10.10.23 Sean Flook        IMANN-163 Changes required for opening tab after property wizard.
//    006   27.10.23 Sean Flook                  Use new dataFormStyle and updated call to SavePropertyAndUpdate..
//    007   10.11.23 Sean Flook                  Removed HasASDPlus as no longer required.
//    008   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system.
//    009   30.11.23 Sean Flook                  Renamed variable to avoid confusion.
//    010   02.01.24 Sean Flook                  Changed console.log to console.error for error messages.
//    011   05.01.24 Sean Flook                  Changes to sort out warnings and use CSS shortcuts.
//    012   10.01.24 Sean Flook                  Fix warnings.
//    013   11.01.24 Sean Flook                  Fix warnings.
//    014   12.01.24 Sean Flook        IMANN-163 Do not try and get the data if we do not have the USRN/UPRN.
//    015   25.01.24 Sean Flook                  Changes required after UX review.
//    016   26.01.24 Sean Flook        IMANN-260 Corrected field name.
//    017   09.02.24 Sean Flook                  Modified handleHistoricPropertyClose to handle returning an action from the historic property warning dialog.
//    018   13.02.24 Joel Benford                Provide hww.usrn to map context when changing street
//    019   13.02.24 Sean Flook                  Corrected the type 66 map data.
//    020   08.03.24 Sean Flook        IMANN-348 Use the new hasStreetChanged and hasPropertyChanged methods as well as updated calls to ResetContexts.
//    021   11.03.24 Sean Flook            GLB12 Adjusted height to remove gap.
//    022   13.03.24 Sean Flook             MUL9 Changes required to facilitate refreshing the data.
//    023   15.03.24 Sean Flook             GLB6 Use individual buttons to toggle between properties and streets.
//    024   15.03.24 Sean Flook        PRFRM1_GP If a property is selected always open it.
//    025   18.03.24 Sean Flook            GLB12 Adjusted height to remove overflow.
//    026   22.03.24 Sean Flook            GLB12 Changed to use dataFormStyle so height can be correctly set.
//    027   04.04.24 Sean Flook                  Added parentUprn to mapContext search data for properties.
//    028   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    029   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    030   24.06.24 Sean Flook        IMANN-170 Changes required for cascading parent PAO changes to children.
//    031   08.07.24 Sean Flook        IMANN-728 Hide the property tab if the user does not have the right to see properties.
//    032   18.07.24 Sean Flook        IMANN-772 Corrected field name.
//    033   07.08.24 Sean Flook        IMANN-891 Moved where ResetContexts is called from to correctly handle historic properties.
//    034   28.08.24 Sean Flook        IMANN-957 Added missing formattedAddress field to map search data.
//    035   10.09.24 Sean Flook        IMANN-980 Only write to the console if the user has the showMessages right.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    036   14.10.24 Sean Flook       IMANN-1016 Changes required to handle LLPG Streets.
//endregion Version 1.0.1.0
//region Version 1.0.2.0
//    037   14.10.24 Sean Flook       IMANN-1100 Call onEditMapObject when opening a property.
//endregion Version 1.0.2.0
//region Version 1.0.5.0
//    038   30.01.25 Sean Flook       IMANN-1673 Changes required for new user settings API.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import UserContext from "../context/userContext";
import SandboxContext from "../context/sandboxContext";
import MapContext from "../context/mapContext";
import LookupContext from "../context/lookupContext";
import SearchContext from "../context/searchContext";
import SettingsContext from "../context/settingsContext";

import { Avatar, SvgIcon, Skeleton, Tooltip, IconButton, Typography, Snackbar, Alert, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";

import {
  GetRelatedPropertyByUSRNUrl,
  GetRelatedPropertyByUPRNUrl,
  GetRelatedStreetByUSRNUrl,
  GetRelatedStreetByUPRNUrl,
  GetRelatedStreetWithASDByUSRNUrl,
  GetRelatedStreetWithASDByUPRNUrl,
} from "../configuration/ADSConfig";
import { GetWktCoordinates, GetChangedAssociatedRecords, ResetContexts } from "../utils/HelperUtils";
import { GetStreetMapData, GetCurrentStreetData, SaveStreet, hasStreetChanged } from "../utils/StreetUtils";
import {
  GetCurrentPropertyData,
  SavePropertyAndUpdate,
  hasParentPaoChanged,
  hasPropertyChanged,
} from "../utils/PropertyUtils";

import { useSaveConfirmation } from "../pages/SaveConfirmationPage";
import HistoricPropertyDialog from "../dialogs/HistoricPropertyDialog";
import RelatedPropertyTab from "./RelatedPropertyTab";
import RelatedStreetTab from "./RelatedStreetTab";

import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import {
  toolbarStyle,
  dataFormStyle,
  GetAlertStyle,
  GetAlertIcon,
  GetAlertSeverity,
  ActionIconStyle,
  tooltipStyle,
  blueButtonStyle,
  greyButtonStyle,
  relatedAvatarStyle,
} from "../utils/ADSStyles";

RelatedTab.propTypes = {
  variant: PropTypes.string.isRequired,
  propertyCount: PropTypes.number.isRequired,
  streetCount: PropTypes.number.isRequired,
  onSetCopyOpen: PropTypes.func.isRequired,
  onPropertyAdd: PropTypes.func.isRequired,
};

function RelatedTab({ variant, propertyCount, streetCount, onSetCopyOpen, onPropertyAdd }) {
  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const userContext = useContext(UserContext);
  const sandboxContext = useContext(SandboxContext);
  const mapContext = useContext(MapContext);
  const lookupContext = useContext(LookupContext);
  const searchContext = useContext(SearchContext);
  const settingsContext = useContext(SettingsContext);

  const [apiUrl, setApiUrl] = useState(null);
  const [propertyData, setPropertyData] = useState({});
  const [streetData, setStreetData] = useState({});
  const dataUsrn = useRef(null);
  const dataUprn = useRef(null);
  const [loading, setLoading] = useState(true);
  const [relatedType, setRelatedType] = useState(
    userContext.currentUser && userContext.currentUser.hasProperty ? "property" : "street"
  );
  const [expandAll, setExpandAll] = useState("Expand all");
  const [expanded, setExpanded] = useState([]);

  const [propertyChecked, setPropertyChecked] = useState([]);
  const [streetChecked, setStreetChecked] = useState([]);

  const [saveOpen, setSaveOpen] = useState(false);
  const saveResult = useRef(null);
  const saveType = useRef(null);
  const failedValidation = useRef(null);
  const associatedRecords = useRef([]);
  const [hasASD, setHasASD] = useState(false);

  const [openHistoricProperty, setOpenHistoricProperty] = useState(false);
  const historicRec = useRef(null);

  const saveConfirmDialog = useSaveConfirmation();

  /**
   * Event to handle when the tab changes.
   *
   * @param {object} event The event object, not used.
   * @param {string} newTab The type for the new tab.
   */
  const handleTabChange = (newTab) => {
    if (newTab !== relatedType) setRelatedType(newTab);
  };

  /**
   * Event to handle when the expand all button is clicked.
   */
  const handleExpandAll = () => {
    const expandList =
      relatedType === "property"
        ? propertyData && propertyData.properties
          ? [...new Set(propertyData.properties.filter((x) => x.parentUprn).map((x) => x.parentUprn.toString()))]
          : []
        : streetData && streetData.street
        ? streetData.street
            .map((x) => x.usrn.toString())
            .concat(streetData.street.map((x) => `esu-root-${x.usrn.toString()}`))
            .concat(streetData.street.map((x) => `asd-root-${x.usrn.toString()}`))
        : [];
    setExpanded(expandAll === "Expand all" ? expandList : []);
    setExpandAll((oldExpandAll) => (oldExpandAll === "Expand all" ? "Collapse all" : "Expand all"));
  };

  /**
   * Method to handle editing the given property.
   *
   * @param {number} uprn The UPRN of the property
   * @param {number} parentUprn The parent UPRN of the property
   * @param {string} address The address for the property
   * @param {string} postcode The properties postcode
   * @param {number} easting The easting for the property
   * @param {number} northing The northing for the property
   * @param {number} logicalStatus The logical status of the property
   * @param {string} classificationCode The classification code of the property
   */
  const doEditProperty = (
    uprn,
    parentUprn,
    address,
    postcode,
    easting,
    northing,
    logicalStatus,
    classificationCode,
    resetType
  ) => {
    ResetContexts(resetType, mapContext, streetContext, propertyContext, sandboxContext);
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
    }
    mapContext.onEditMapObject(21, uprn);
    mapContext.onHighlightStreetProperty(null, [uprn.toString()]);
  };

  /**
   * Method to handle editing of a property if it is not historic.
   *
   * @param {number} uprn The UPRN of the property
   * @param {number} parentUprn The parent UPRN of the property
   * @param {string} address The address for the property
   * @param {string} postcode The properties postcode
   * @param {number} easting The easting for the property
   * @param {number} northing The northing for the property
   * @param {number} logicalStatus The logical status of the property
   * @param {string} classificationCode The classification code of the property
   */
  const editProperty = (
    uprn,
    parentUprn,
    address,
    postcode,
    easting,
    northing,
    logicalStatus,
    classificationCode,
    resetType
  ) => {
    if (logicalStatus && logicalStatus === 8) {
      historicRec.current = {
        uprn: uprn,
        parentUprn: parentUprn,
        address: address,
        postcode: postcode,
        easting: easting,
        northing: northing,
        logicalStatus: logicalStatus,
        classificationCode: classificationCode,
        resetType: resetType,
      };
      setOpenHistoricProperty(true);
    } else
      doEditProperty(
        uprn,
        parentUprn,
        address,
        postcode,
        easting,
        northing,
        logicalStatus,
        classificationCode,
        resetType
      );
  };

  /**
   * Method to handle the editing of a street.
   *
   * @param {number} usrn The USRN of the street
   * @param {string} description The descriptor for the street
   * @param {string} language The language of the descriptor.
   * @param {string} locality The locality for the street.
   * @param {string} town The town for the street.
   */
  async function editStreet(usrn, description, language, locality, town, resetType) {
    ResetContexts(resetType, mapContext, streetContext, propertyContext, sandboxContext);
    streetContext.onStreetChange(usrn, description, false);
    const foundStreet =
      MapContext.currentLayers &&
      MapContext.currentSearchData.streets &&
      MapContext.currentSearchData.streets.find(({ usrn }) => usrn.toString() === usrn);
    if (foundStreet) {
      mapContext.onSearchDataChange(
        mapContext.currentSearchData.streets,
        mapContext.currentSearchData.llpgStreets,
        mapContext.currentSearchData.properties,
        usrn,
        null
      );
    } else {
      const streetData = await GetStreetMapData(usrn, userContext, settingsContext.isScottish);
      const esus = streetData
        ? userContext.currentUser.hasStreet
          ? streetData.esus.map((rec) => ({
              esuId: rec.esuId,
              state: settingsContext.isScottish ? rec.state : undefined,
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
      const asdType51 =
        userContext.currentUser.hasStreet && settingsContext.isScottish && streetData
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
        userContext.currentUser.hasStreet && settingsContext.isScottish && streetData
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
        userContext.currentUser.hasStreet && settingsContext.isScottish && streetData
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
        userContext.currentUser.hasStreet && !settingsContext.isScottish && hasASD && streetData
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
        userContext.currentUser.hasStreet && !settingsContext.isScottish && hasASD && streetData
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
        userContext.currentUser.hasStreet && !settingsContext.isScottish && hasASD && streetData
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
        userContext.currentUser.hasStreet && !settingsContext.isScottish && hasASD && streetData
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
        userContext.currentUser.hasStreet && !settingsContext.isScottish && hasASD && streetData
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
          language: language,
          locality: locality,
          town: town,
          state: !settingsContext.isScottish && streetData ? streetData.state : undefined,
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
    mapContext.onHighlightStreetProperty([usrn.toString()], null);
  }

  /**
   * Event to handle when a property node is selected.
   *
   * @param {number} nodeId The id of the node that was selected.
   */
  const handlePropertyNodeSelect = (nodeId, resetType) => {
    const nodeData = propertyData.properties.find((x) => x.uprn.toString() === nodeId);

    if (nodeData) {
      editProperty(
        nodeData.uprn,
        nodeData.parentUprn,
        nodeData.primary.address,
        nodeData.primary.postcode,
        nodeData.easting,
        nodeData.northing,
        nodeData.primary.logicalStatus,
        nodeData.blpuClass,
        resetType
      );
    }
  };

  /**
   * Event to handle when a street node is selected.
   *
   * @param {number} nodeId The id of the node that was selected.
   */
  const handleStreetNodeSelect = (nodeId, resetType) => {
    const nodeData = streetData.street.find((x) => x.usrn.toString() === nodeId);

    if (nodeData) {
      editStreet(
        nodeData.usrn,
        nodeData.primary.address,
        nodeData.primary.language,
        nodeData.primary.locality,
        nodeData.primary.town,
        resetType
      );
    }
  };

  /**
   * Event to handle closing the property save dialog.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the dialog is closing
   * @returns
   */
  const handlePropertySaveClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSaveOpen(false);
  };

  /**
   * Event to handle the saving of a street.
   *
   * @param {object} currentStreet The data for the current street.
   */
  function HandleSaveStreet(currentStreet) {
    SaveStreet(
      currentStreet,
      streetContext,
      userContext,
      lookupContext,
      searchContext,
      mapContext,
      sandboxContext,
      settingsContext.isScottish,
      settingsContext.isWelsh
    ).then((result) => {
      if (result) {
        saveResult.current = true;
        saveType.current = "street";
        setSaveOpen(true);
      } else {
        saveResult.current = false;
        saveType.current = "street";
        setSaveOpen(true);
      }
    });
  }

  /**
   * Event to handle the saving of a property.
   *
   * @param {Object} currentProperty The data for the current property.
   * @param {Boolean} cascadeParentPaoChanges If true the child property PAO details need to be changed; otherwise they are not changed.
   */
  function HandleSaveProperty(currentProperty, cascadeParentPaoChanges) {
    SavePropertyAndUpdate(
      currentProperty,
      propertyContext.currentProperty.newProperty,
      propertyContext,
      userContext,
      lookupContext,
      searchContext,
      mapContext,
      sandboxContext,
      settingsContext.isScottish,
      settingsContext.isWelsh,
      cascadeParentPaoChanges
    ).then((result) => {
      if (result) {
        saveResult.current = true;
        saveType.current = "property";
        setSaveOpen(true);
      } else {
        saveResult.current = false;
        saveType.current = "property";
        setSaveOpen(true);
      }
    });
  }

  /**
   * Event to handle when a node from the tree view is selected.
   *
   * @param {string} nodeType The type of node that was selected.
   * @param {number} nodeId The id of the selected node.
   */
  const handleTreeViewNodeSelect = (nodeType, nodeId) => {
    if (sandboxContext.currentSandbox.sourceStreet) {
      const streetChanged = hasStreetChanged(
        streetContext.currentStreet.newStreet,
        sandboxContext.currentSandbox,
        hasASD
      );

      if (streetChanged) {
        associatedRecords.current = GetChangedAssociatedRecords("street", sandboxContext, streetContext.esuDataChanged);

        const streetData = sandboxContext.currentSandbox.currentStreet
          ? sandboxContext.currentSandbox.currentStreet
          : sandboxContext.currentSandbox.sourceStreet;

        if (associatedRecords.current.length > 0) {
          saveConfirmDialog(associatedRecords.current)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  const currentStreetData = GetCurrentStreetData(
                    streetData,
                    sandboxContext,
                    lookupContext,
                    settingsContext.isWelsh,
                    settingsContext.isScottish,
                    hasASD
                  );
                  HandleSaveStreet(currentStreetData);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              }
              // ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
              if (nodeType === "property") handlePropertyNodeSelect(nodeId, "street");
              else handleStreetNodeSelect(nodeId, "street");
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true)
            .then((result) => {
              if (result === "save") {
                HandleSaveStreet(sandboxContext.currentSandbox.currentStreet);
              }
              // ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
              if (nodeType === "property") handlePropertyNodeSelect(nodeId, "street");
              else handleStreetNodeSelect(nodeId, "street");
            })
            .catch(() => {});
        }
      } else {
        // ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
        if (nodeType === "property") handlePropertyNodeSelect(nodeId, "street");
        else handleStreetNodeSelect(nodeId, "street");
      }
    } else if (sandboxContext.currentSandbox.sourceProperty) {
      const propertyChanged = hasPropertyChanged(
        propertyContext.currentProperty.newProperty,
        sandboxContext.currentSandbox
      );

      if (propertyChanged) {
        associatedRecords.current = GetChangedAssociatedRecords("property", sandboxContext);

        const parentPaoChanged = hasParentPaoChanged(
          propertyContext.childCount,
          sandboxContext.currentSandbox.sourceProperty,
          sandboxContext.currentSandbox.currentProperty
        );

        const contextPropertyData = sandboxContext.currentSandbox.currentProperty
          ? sandboxContext.currentSandbox.currentProperty
          : sandboxContext.currentSandbox.sourceProperty;

        if (associatedRecords.current.length > 0) {
          saveConfirmDialog(associatedRecords.current, parentPaoChanged)
            .then((result) => {
              if (result === "save" || result === "saveCascade") {
                if (propertyContext.validateData()) {
                  failedValidation.current = false;
                  const currentPropertyData = GetCurrentPropertyData(
                    contextPropertyData,
                    sandboxContext,
                    lookupContext,
                    settingsContext.isWelsh,
                    settingsContext.isScottish
                  );
                  HandleSaveProperty(currentPropertyData, result === "saveCascade");
                  // ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
                  if (nodeType === "property") handlePropertyNodeSelect(nodeId, "property");
                  else handleStreetNodeSelect(nodeId, "property");
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                // ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
                if (nodeType === "property") handlePropertyNodeSelect(nodeId, "property");
                else handleStreetNodeSelect(nodeId, "property");
              }
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true, parentPaoChanged)
            .then((result) => {
              if (result === "save" || result === "saveCascade") {
                HandleSaveProperty(sandboxContext.currentSandbox.currentProperty, result === "saveCascade");
              }
              // ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
              if (nodeType === "property") handlePropertyNodeSelect(nodeId, "property");
              else handleStreetNodeSelect(nodeId, "property");
            })
            .catch(() => {});
        }
      } else {
        // ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
        if (nodeType === "property") handlePropertyNodeSelect(nodeId, "property");
        else handleStreetNodeSelect(nodeId, "property");
      }
    } else {
      // ResetContexts("all", mapContext, streetContext, propertyContext, sandboxContext);
      if (nodeType === "property") handlePropertyNodeSelect(nodeId, "all");
      else handleStreetNodeSelect(nodeId, "all");
    }
  };

  /**
   * Event to handle toggling of the tree view nodes.
   *
   * @param {Array} nodeIds Tha array of node ids for the expanded nodes.
   */
  const handleTreeViewNodeToggle = (nodeIds) => {
    setExpanded(nodeIds);
  };

  /**
   * Event to handle checking of the streets.
   *
   * @param {Array} checked The list of checked items.
   */
  const handleStreetChecked = (checked) => {
    setStreetChecked(checked);
  };

  /**
   * Event to handle checking of the properties.
   *
   * @param {Array} checked The list of checked items.
   */
  const handlePropertyChecked = (checked) => {
    setPropertyChecked(checked);
  };

  /**
   * Event to handle the display of the property copy alert.
   *
   * @param {boolean} open True if the copy alert should be opened; otherwise false.
   * @param {string} dataType The type of data being copied.
   */
  const handlePropertySetCopyOpen = (open, dataType) => {
    if (onSetCopyOpen) onSetCopyOpen(open, dataType);
  };

  /**
   * Event to handle the creation of child properties.
   *
   * @param {number} usrn The USRN of the street the property.
   * @param {object} parent The parent data.
   * @param {boolean} isRange True if a range of children are to be created; otherwise false.
   */
  const handlePropertyChildAdd = (usrn, parent, isRange) => {
    if (onPropertyAdd) onPropertyAdd(usrn, parent, isRange);
  };

  /**
   * Event to handle the display of the street copy alert.
   *
   * @param {boolean} open True if the copy alert should be opened; otherwise false.
   * @param {string} dataType The type of data being copied.
   */
  const handleStreetSetCopyOpen = (open, dataType) => {
    if (onSetCopyOpen) onSetCopyOpen(open, dataType);
  };

  /**
   * Event to handle the creation of properties on a street.
   *
   * @param {number} usrn The USRN of the street the property.
   * @param {object} parent The parent data.
   * @param {boolean} isRange True if a range of children are to be created; otherwise false.
   */
  const handleStreetPropertyAdd = (usrn, parent, isRange) => {
    if (onPropertyAdd) onPropertyAdd(usrn, parent, isRange);
  };

  /**
   * Event to handle the closing of the historic dialog.
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
          historicRec.current.classificationCode,
          historicRec.current.resetType
        );
      }
    }
  };

  useEffect(() => {
    if (sandboxContext.refreshRelated) {
      sandboxContext.onRefreshRelated(false);
      setStreetData(null);
      setPropertyData(null);
    }
  }, [sandboxContext]);

  useEffect(() => {
    async function SetUpRelatedData() {
      const changedParent =
        variant === "street"
          ? streetContext.currentStreet.usrn !== dataUsrn.current
          : propertyContext.currentProperty.uprn !== dataUprn.current ||
            propertyContext.currentProperty.usrn !== dataUsrn.current;
      if (
        (relatedType === "property" &&
          (!propertyData || (Object.keys(propertyData).length === 0 && propertyData.constructor === Object))) ||
        (relatedType === "street" &&
          (!streetData || (Object.keys(streetData).length === 0 && streetData.constructor === Object))) ||
        changedParent
      ) {
        if (apiUrl) {
          setLoading(true);
          const fetchUrl =
            relatedType === "property"
              ? variant === "street"
                ? streetContext.currentStreet.usrn > 0
                  ? `${apiUrl.propertyUsrn.url}/${streetContext.currentStreet.usrn}`
                  : null
                : propertyContext.currentProperty.uprn > 0
                ? `${apiUrl.propertyUprn.url}/${propertyContext.currentProperty.uprn}`
                : propertyContext.currentProperty.usrn > 0
                ? `${apiUrl.propertyUsrn.url}/${propertyContext.currentProperty.usrn}`
                : null
              : variant === "street"
              ? settingsContext.isScottish || hasASD
                ? streetContext.currentStreet.usrn > 0
                  ? `${apiUrl.streetWithASDUsrn.url}/${streetContext.currentStreet.usrn}`
                  : null
                : streetContext.currentStreet.usrn > 0
                ? `${apiUrl.streetUsrn.url}/${streetContext.currentStreet.usrn}`
                : null
              : propertyContext.currentProperty.uprn > 0
              ? settingsContext.isScottish || hasASD
                ? `${apiUrl.streetWithASDUprn.url}/${propertyContext.currentProperty.uprn}`
                : `${apiUrl.streetUprn.url}/${propertyContext.currentProperty.uprn}`
              : settingsContext.isScottish || hasASD
              ? propertyContext.currentProperty.usrn > 0
                ? `${apiUrl.streetWithASDUsrn.url}/${propertyContext.currentProperty.usrn}`
                : null
              : propertyContext.currentProperty.usrn > 0
              ? `${apiUrl.streetUsrn.url}/${propertyContext.currentProperty.usrn}`
              : null;
          if (fetchUrl) {
            fetch(fetchUrl, {
              headers: apiUrl.propertyUsrn.headers,
              crossDomain: true,
              method: "GET",
            })
              .then((res) => (res.ok ? res : Promise.reject(res)))
              .then((res) => {
                if (res.status && res.status === 204) return [];
                else return res.json();
              })
              .then(
                (result) => {
                  if (relatedType === "property") setPropertyData(result);
                  else setStreetData(result);
                },
                (error) => {
                  if (error.status && error.status === 401) {
                    userContext.onExpired();
                  } else {
                    if (userContext.currentUser.showMessages)
                      console.error(`[ERROR] Get ${relatedType} related data`, error);
                  }
                }
              )
              .then(() => {
                if (variant === "street") dataUsrn.current = streetContext.currentStreet.usrn;
                else {
                  dataUprn.current = propertyContext.currentProperty.uprn;
                  dataUsrn.current = propertyContext.currentProperty.usrn;
                }
                setLoading(false);
              });
          }
        } else {
          if (userContext.currentUser.showMessages) console.error("[ERROR] Related apiUrl is null");
        }
      }
    }

    if (!apiUrl) {
      const relatedPropertyUsrnUrl = GetRelatedPropertyByUSRNUrl(userContext.currentUser);
      const relatedPropertyUprnUrl = GetRelatedPropertyByUPRNUrl(userContext.currentUser);
      const relatedStreetUsrnUrl = GetRelatedStreetByUSRNUrl(userContext.currentUser);
      const relatedStreetUprnUrl = GetRelatedStreetByUPRNUrl(userContext.currentUser);
      const relatedStreetWithASDUsrnUrl = GetRelatedStreetWithASDByUSRNUrl(userContext.currentUser);
      const relatedStreetWithASDUprnUrl = GetRelatedStreetWithASDByUPRNUrl(userContext.currentUser);
      setApiUrl({
        propertyUsrn: relatedPropertyUsrnUrl,
        propertyUprn: relatedPropertyUprnUrl,
        streetUsrn: relatedStreetUsrnUrl,
        streetUprn: relatedStreetUprnUrl,
        streetWithASDUsrn: relatedStreetWithASDUsrnUrl,
        streetWithASDUprn: relatedStreetWithASDUprnUrl,
      });
    } else if (!relatedType) {
      setRelatedType(userContext.currentUser && userContext.currentUser.hasProperty ? "property" : "street");
    } else if (
      ((!propertyData || (Object.keys(propertyData).length === 0 && propertyData.constructor === Object)) &&
        relatedType === "property") ||
      ((!streetData || (Object.keys(streetData).length === 0 && streetData.constructor === Object)) &&
        relatedType === "street") ||
      (variant === "property" &&
        ((propertyContext.currentProperty.uprn > 0 && dataUprn.current !== propertyContext.currentProperty.uprn) ||
          (propertyContext.currentProperty.usrn > 0 && dataUsrn.current !== propertyContext.currentProperty.usrn))) ||
      (variant === "street" &&
        streetContext.currentStreet.usrn > 0 &&
        dataUsrn.current !== streetContext.currentStreet.usrn)
    ) {
      SetUpRelatedData();
    }
    return () => {};
  }, [
    apiUrl,
    variant,
    streetContext,
    propertyContext,
    userContext,
    propertyData,
    streetData,
    relatedType,
    settingsContext,
    hasASD,
  ]);

  useEffect(() => {
    setHasASD(userContext.currentUser && userContext.currentUser.hasASD);
  }, [userContext]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id="ads-related-toolbar">
        <Stack
          sx={{ pl: "12px", pr: "12px", pt: "4px", mt: "-2px" }}
          direction="row"
          spacing={1}
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center" sx={{ height: "30px" }}>
            {userContext.currentUser && userContext.currentUser.hasProperty && (
              <Button
                autoFocus
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => handleTabChange("property")}
                sx={relatedType === "property" ? blueButtonStyle : greyButtonStyle}
              >
                <Typography variant="caption">Properties</Typography>
                <Avatar variant="rounded" sx={relatedAvatarStyle(propertyCount, relatedType === "property")}>
                  <Typography variant="caption">
                    <strong>{propertyCount}</strong>
                  </Typography>
                </Avatar>
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={
                <SvgIcon
                  style={{
                    fillRule: "evenodd",
                    clipRule: "evenodd",
                    strokeLinejoin: "round",
                    strokeMiterlimit: 2,
                  }}
                >
                  <path d="M21,21L3,21L7.5,3L16.5,3L21,21ZM13,14L11,14L11,18L13,18L13,14ZM13,9L11,9L11,12L13,12L13,9ZM13,5L11,5L11,7L13,7L13,5Z" />
                </SvgIcon>
              }
              onClick={() => handleTabChange("street")}
              sx={relatedType === "street" ? blueButtonStyle : greyButtonStyle}
            >
              <Typography variant="caption">Streets</Typography>
              <Avatar variant="rounded" sx={relatedAvatarStyle(streetCount, relatedType === "street")}>
                <Typography variant="caption">
                  <strong>{streetCount}</strong>
                </Typography>
              </Avatar>
            </Button>
          </Stack>
          <Tooltip title={`${expandAll} items in list`} arrow placement="right" sx={tooltipStyle}>
            <IconButton onClick={handleExpandAll} sx={ActionIconStyle()} aria-controls="expand-collapse" size="small">
              {expandAll === "Expand all" ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              <Typography variant="body2">{expandAll}</Typography>
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <Box sx={dataFormStyle(`${variant === "street" ? "StreetRelatedTab" : "PropertyRelatedTab"}`)}>
        {loading ? (
          <Skeleton variant="rectangular" height="30px" width="100%" />
        ) : relatedType === "property" && userContext.currentUser && userContext.currentUser.hasProperty ? (
          <RelatedPropertyTab
            data={propertyData}
            variant={variant}
            loading={loading}
            expanded={expanded}
            checked={propertyChecked}
            onNodeSelect={(nodeType, nodeId) => handleTreeViewNodeSelect(nodeType, nodeId)}
            onNodeToggle={(nodeIds) => handleTreeViewNodeToggle(nodeIds)}
            onChecked={handlePropertyChecked}
            onSetCopyOpen={(open, dataType) => handlePropertySetCopyOpen(open, dataType)}
            onPropertyAdd={(usrn, parent, isRange) => handlePropertyChildAdd(usrn, parent, isRange)}
          />
        ) : (
          <RelatedStreetTab
            data={streetData}
            variant={variant}
            loading={loading}
            expanded={expanded}
            checked={streetChecked}
            onNodeSelect={(nodeType, nodeId) => handleTreeViewNodeSelect(nodeType, nodeId)}
            onNodeToggle={(nodeIds) => handleTreeViewNodeToggle(nodeIds)}
            onChecked={handleStreetChecked}
            onSetCopyOpen={(open, dataType) => handleStreetSetCopyOpen(open, dataType)}
            onPropertyAdd={(usrn, parent, isRange) => handleStreetPropertyAdd(usrn, parent, isRange)}
          />
        )}
      </Box>
      <div>
        <Snackbar
          open={saveOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handlePropertySaveClose}
        >
          <Alert
            sx={GetAlertStyle(saveResult.current)}
            icon={GetAlertIcon(saveResult.current)}
            onClose={handlePropertySaveClose}
            severity={GetAlertSeverity(saveResult.current)}
            elevation={6}
            variant="filled"
          >{`${
            saveResult.current
              ? `The ${saveType.current} has been successfully saved.`
              : failedValidation.current
              ? `Failed to validate the ${saveType.current} record.`
              : `Failed to save the ${saveType.current}.`
          }`}</Alert>
        </Snackbar>
        <HistoricPropertyDialog open={openHistoricProperty} onClose={handleHistoricPropertyClose} />
      </div>
    </Fragment>
  );
}

export default RelatedTab;
