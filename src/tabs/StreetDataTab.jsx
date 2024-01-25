/* #region header */
/**************************************************************************************************
//
//  Description: Street data tab
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   30.07.21 Sean Flook         WI39??? Initial Revision.
//    002   17.03.23 Sean Flook         WI40585 Hide Add property and range menu items.
//    003   20.07.23 Sean Flook                 Added ability to display the street in Google street view.
//    004   06.10.23 Sean Flook                 Added a call to DisplayStreetInStreetView and use colour variables.
//    005   16.10.23 Sean Flook       IMANN-157 Display the create property and create properties menu actions for all builds.
//    006   27.10.23 Sean Flook                 Use new dataFormStyle.
//    007   03.11.23 Sean Flook                 Corrected actions icon and closing a street.
//    008   10.11.23 Sean Flook                 Removed HasASDPlus as no longer required.
//    009   24.11.23 Sean Flook                 Moved Box to @mui/system and fixed a warning.
//    010   20.12.23 Sean Flook                 Hide the Delete button until code has been written.
//    011   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    012   11.01.24 Sean Flook                 Fix warnings.
//    013   25.01.24 Joel Benford               Stop overriding descriptor background.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import StreetContext from "../context/streetContext";
import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";
import MapContext from "../context/mapContext";
import SettingsContext from "../context/settingsContext";
import { HasASD } from "../configuration/ADSConfig";
import { copyTextToClipboard, GetLookupLabel, ConvertDate } from "../utils/HelperUtils";
import { streetToTitleCase, FilteredStreetType, DisplayStreetInStreetView } from "../utils/StreetUtils";
import DETRCodes from "../data/DETRCodes";
import StreetState from "../data/StreetState";
import StreetSurface from "../data/StreetSurface";
import StreetClassification from "../data/StreetClassification";
import {
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Fade,
  Skeleton,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSSwitchControl from "../components/ADSSwitchControl";
import ADSCoordinateControl from "../components/ADSCoordinateControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import ActionsIcon from "@mui/icons-material/MoreVert";
import AddCircleIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { CopyIcon } from "../utils/ADSIcons";
import { adsBlueA, adsRed10, adsRed20, adsWhite, adsLightBlue10 } from "../utils/ADSColours";
import {
  toolbarStyle,
  ActionIconStyle,
  dataFormStyle,
  FormRowStyle,
  menuStyle,
  menuItemStyle,
  tooltipStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

StreetDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  descriptorErrors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onSetCopyOpen: PropTypes.func.isRequired,
  onDescriptorSelected: PropTypes.func.isRequired,
  onDataChanged: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onPropertyAdd: PropTypes.func.isRequired,
};

function StreetDataTab({
  data,
  errors,
  descriptorErrors,
  loading,
  focusedField,
  onSetCopyOpen,
  onDescriptorSelected,
  onDataChanged,
  onDelete,
  onPropertyAdd,
}) {
  const theme = useTheme();

  const streetContext = useContext(StreetContext);
  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const settingsContext = useContext(SettingsContext);

  const [itemSelected, setItemSelected] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const [streetTypeLookup, setStreetTypeLookup] = useState(FilteredStreetType(settingsContext.isScottish));

  const [usrn, setUsrn] = useState(0);
  const [streetType, setStreetType] = useState(null);
  const [authority, setAuthority] = useState(settingsContext ? settingsContext.authorityCode : null);
  const [state, setState] = useState(null);
  const [stateDate, setStateDate] = useState(null);
  const [classification, setClassification] = useState(null);
  const [surface, setSurface] = useState(null);
  const [eastingStart, setEastingStart] = useState(0);
  const [northingStart, setNorthingStart] = useState(0);
  const [eastingEnd, setEastingEnd] = useState(0);
  const [northingEnd, setNorthingEnd] = useState(0);
  const [tolerance, setTolerance] = useState(0);
  const [excludeFromExport, setExcludeFromExport] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [userCanEdit, setUserCanEdit] = useState(false);
  const [adminUser, setAdminUser] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [streetAssociatedRecords, setStreetAssociatedRecords] = useState(null);

  const [usrnError, setUsrnError] = useState(null);
  const [streetTypeError, setStreetTypeError] = useState(null);
  const [authorityError, setAuthorityError] = useState(null);
  const [stateError, setStateError] = useState(null);
  const [stateDateError, setStateDateError] = useState(null);
  const [classificationError, setClassificationError] = useState(null);
  const [surfaceError, setSurfaceError] = useState(null);
  const [startEastingError, setStartEastingError] = useState(null);
  const [startNorthingError, setStartNorthingError] = useState(null);
  const [endEastingError, setEndEastingError] = useState(null);
  const [endNorthingError, setEndNorthingError] = useState(null);
  const [toleranceError, setToleranceError] = useState(null);
  const [excludeFromExportError, setExcludeFromExportError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);

  /**
   * Event to handle opening a descriptor record.
   *
   * @param {number} pkId The id for the descriptor record that needs to be opened.
   * @param {number} dataIndx The index of the descriptor record within the array of descriptor records.
   */
  const handleOpenDescriptor = (pkId, dataIndx) => {
    const sdDataArray = data.streetDescriptors.filter((x) => x.pkId === pkId);

    if (sdDataArray && sdDataArray.length > 0 && onDescriptorSelected)
      onDescriptorSelected(pkId, sdDataArray[0], dataIndx, data.streetDescriptors.length);
  };

  /**
   * Handle the mouse enter event for the list of street descriptors.
   *
   * @param {number} recId The id of the record that the mouse has entered.
   */
  const handleMouseEnter = (recId) => {
    setItemSelected(recId);
  };

  /**
   * Handle the mouse leave event for the list of street descriptors.
   */
  const handleMouseLeave = () => {
    setItemSelected(null);
  };

  /**
   * Update the current data.
   *
   * @param {string|number|boolean|Date|null} newValue The new value for the given field to update.
   * @param {string} updatedField The name of the field to update with the new value.
   * @param {boolean} updateMap True if this field will update the map; otherwise false.
   */
  const updateCurrentData = (newValue, updatedField, updateMap) => {
    const currentData = {
      state:
        updatedField === "state"
          ? newValue
          : settingsContext.isScottish
          ? data.esus && data.esus.length > 0
            ? data.esus[0].state
            : null
          : state,
      stateDate:
        updatedField === "stateDate"
          ? newValue
            ? ConvertDate(newValue)
            : null
          : settingsContext.isScottish
          ? data.esus && data.esus.length > 0 && data.esus[0].stateDate
            ? ConvertDate(data.esus[0].stateDate)
            : null
          : stateDate && ConvertDate(stateDate),
      streetClassification:
        updatedField === "streetClassification"
          ? newValue
          : settingsContext.isScottish
          ? data.esus && data.esus.length > 0
            ? data.esus[0].classification
            : null
          : classification,
      usrn: updatedField === "usrn" ? newValue : usrn,
      recordType: updatedField === "recordType" ? newValue : streetType,
      swaOrgRefNaming: updatedField === "swaOrgRefNaming" ? newValue : authority,
      streetSurface: updatedField === "streetSurface" ? newValue : surface,
      streetStartDate:
        updatedField === "streetStartDate"
          ? newValue
            ? ConvertDate(newValue)
            : null
          : startDate && ConvertDate(startDate),
      streetEndDate:
        updatedField === "streetEndDate" ? (newValue ? ConvertDate(newValue) : null) : endDate && ConvertDate(endDate),
      streetStartX: updatedField === "streetStartX" ? newValue : eastingStart,
      streetStartY: updatedField === "streetStartY" ? newValue : northingStart,
      streetEndX: updatedField === "streetEndX" ? newValue : eastingEnd,
      streetEndY: updatedField === "streetEndY" ? newValue : northingEnd,
      streetTolerance: updatedField === "streetTolerance" ? newValue : tolerance,
      neverExport: updatedField === "neverExport" ? newValue : excludeFromExport,
    };
    if (onDataChanged) onDataChanged(currentData);
    if (updateMap) mapContext.onMapStreetChange(currentData);
  };

  /**
   * Event to handle when the USRN is changed.
   *
   * @param {string|null} newValue The new USRN value.
   */
  const handleUSRNChangeEvent = (newValue) => {
    console.log("handleUSRNChangeEvent", { newUsrn: newValue });
    setUsrn(parseInt(newValue));
    updateCurrentData(parseInt(newValue), "usrn", false);
  };

  /**
   * Event to handle when the street type changes.
   *
   * @param {number|null} newValue The new street type value.
   */
  const handleStreetTypeChangeEvent = (newValue) => {
    setStreetType(newValue);
    updateCurrentData(newValue, "recordType", true);
  };

  /**
   * Event to handle when the authority changes.
   *
   * @param {number|null} newValue The new authority value.
   */
  const handleAuthorityChangeEvent = (newValue) => {
    setAuthority(newValue);
    updateCurrentData(newValue, "swaOrgRefNaming", false);
  };

  /**
   * Event to handle when the state changes.
   *
   * @param {number|null} newValue The new state value.
   */
  const handleStateChangeEvent = (newValue) => {
    setState(newValue);
    updateCurrentData(newValue, "state", false);
  };

  /**
   * Event to handle when the state date changes.
   *
   * @param {Date|null} newValue The new state date value.
   */
  const handleStateDateChangeEvent = (newValue) => {
    setStateDate(newValue);
    updateCurrentData(newValue, "stateDate", false);
  };

  /**
   * Event to handle when the classification changes.
   *
   * @param {string|null} newValue The new classification value.
   */
  const handleClassificationChangeEvent = (newValue) => {
    setClassification(newValue);
    updateCurrentData(newValue, "streetClassification", false);
  };

  /**
   * Event to handle when the surface changes.
   *
   * @param {number|null} newValue The new surface value.
   */
  const handleSurfaceChangeEvent = (newValue) => {
    setSurface(newValue);
    updateCurrentData(newValue, "streetSurface", false);
  };

  /**
   * Event to handle when the start easting changes.
   *
   * @param {number|null} newValue The new start easting value.
   */
  const handleEastingStartChangeEvent = (newValue) => {
    setEastingStart(newValue);
    updateCurrentData(newValue, "streetStartX", true);
  };

  /**
   * Event to handle when the start northing changes.
   *
   * @param {number|null} newValue The new start northing value.
   */
  const handleNorthingStartChangeEvent = (newValue) => {
    setNorthingStart(newValue);
    updateCurrentData(newValue, "streetStartY", true);
  };

  /**
   * Event to handle when the start coordinates button is clicked.
   */
  const handleSelectStartClickEvent = () => {
    mapContext.onPointCapture("streetStart");
  };

  /**
   * Event to handle when the end easting changes.
   *
   * @param {number|null} newValue The new end easting value.
   */
  const handleEastingEndChangeEvent = (newValue) => {
    setEastingEnd(newValue);
    updateCurrentData(newValue, "streetEndX", true);
  };

  /**
   * Event to handle when the end northing changes.
   *
   * @param {number|null} newValue The new end northing value.
   */
  const handleNorthingEndChangeEvent = (newValue) => {
    setNorthingEnd(newValue);
    updateCurrentData(newValue, "streetEndY", true);
  };

  /**
   * Event to handle when the end coordinates button is clicked.
   */
  const handleSelectEndClickEvent = () => {
    mapContext.onPointCapture("streetEnd");
  };

  /**
   * Event to handle when the tolerance changes.
   *
   * @param {number|null} newValue The new tolerance value.
   */
  const handleToleranceChangeEvent = (newValue) => {
    setTolerance(parseInt(newValue));
    updateCurrentData(parseInt(newValue), "streetTolerance", false);
  };

  /**
   * Event to handle when the exclude from export changes.
   *
   */
  const handleExcludeFromExportChangeEvent = () => {
    setExcludeFromExport(!excludeFromExport);
    updateCurrentData(!excludeFromExport, "neverExport", false);
  };

  /**
   * Event to handle when the start date changes.
   *
   * @param {Date|null} newValue The new start date value.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    updateCurrentData(newValue, "streetStartDate", false);
  };

  /**
   * Event to handle when the end date changes.
   *
   * @param {Date|null} newValue The new end date value.
   */
  const handleEndDateChangeEvent = (newValue) => {
    setEndDate(newValue);
    updateCurrentData(newValue, "streetEndDate", false);
  };

  /**
   * Method to get the street address when the data has changed.
   *
   * @param {string|null} descriptor The street description
   * @param {number|null} locRef The id of the locality from the lookup table.
   * @param {number|null} townRef The id of the town from the lookup table.
   * @param {number|null} islandRef The id of the island from the lookup table.
   * @return {string}
   */
  function GetStreetAddress(descriptor, locRef, townRef, islandRef) {
    let locality = "";
    let town = "";
    let island = "";

    if (
      locRef &&
      locRef > 0 &&
      lookupContext &&
      lookupContext.currentLookups &&
      lookupContext.currentLookups.localities
    ) {
      const locRec = lookupContext.currentLookups.localities.filter((x) => x.locRef === locRef);
      locality = locRec[0].locality;
    }

    if (townRef && townRef > 0 && lookupContext && lookupContext.currentLookups && lookupContext.currentLookups.towns) {
      const townRec = lookupContext.currentLookups.towns.filter((x) => x.townRef === townRef);
      town = townRec[0].town;
    }

    if (
      settingsContext.isScottish &&
      islandRef &&
      islandRef > 0 &&
      lookupContext &&
      lookupContext.currentLookups &&
      lookupContext.currentLookups.islands
    ) {
      const islandRec = lookupContext.currentLookups.islands.filter((x) => x.islandRef === islandRef);
      island = islandRec[0].island;
    }

    return descriptor
      ? `${streetToTitleCase(descriptor)}${locality && locality.length > 0 ? ", " + streetToTitleCase(locality) : ""}${
          town && town.length > 0 ? ", " + streetToTitleCase(town) : ""
        }${settingsContext.isScottish && island && island.length > 0 ? ", " + streetToTitleCase(island) : ""}`
      : "";
  }

  /**
   * Event to handle when the user clicks on the actions button.
   *
   * @param {object} event
   */
  const handleActionsClick = (event) => {
    setAnchorEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle when the actions menu closes.
   *
   * @param {object} event
   */
  const handleActionsMenuClose = (event) => {
    setAnchorEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle when the user clicks on the add language menu item.
   *
   * @param {object} event
   */
  const handleAddLanguage = (event) => {
    handleActionsMenuClose(event);
    onDescriptorSelected(0, null, null, null);
  };

  /**
   * Event to handle when the user clicks on the add property menu item.
   *
   * @param {object} event
   */
  const handleAddProperty = (event) => {
    handleActionsMenuClose(event);
    if (onPropertyAdd) onPropertyAdd(streetContext.currentStreet.usrn, null, false);
  };

  /**
   * Event to handle when the user clicks on the add a range of properties menu item.
   *
   * @param {object} event
   */
  const handleAddRange = (event) => {
    handleActionsMenuClose(event);
    if (onPropertyAdd) onPropertyAdd(streetContext.currentStreet.usrn, null, true);
  };

  /**
   * Event to handle when the user clicks on the zoom to street menu item.
   *
   * @param {object} event
   */
  const handleZoomToStreet = () => {
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user clicks on the open in street view menu item.
   *
   * @param {object} event
   */
  const handleOpenInStreetview = () => {
    setAnchorEl(null);
    if (streetContext.currentStreet.usrn) {
      DisplayStreetInStreetView(
        streetContext.currentStreet.usrn,
        userContext.currentUser.token,
        settingsContext.isScottish
      );
    }
  };

  /**
   * Event to handle when the user clicks on the view properties on street menu item.
   *
   * @param {object} event
   */
  const handleViewPropertiesOnStreet = () => {
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user clicks on the copy USRN menu item.
   *
   * @param {object} event
   */
  const handleCopyUsrn = (event) => {
    if (streetContext.currentStreet.usrn) {
      itemCopy(streetContext.currentStreet.usrn.toString(), "USRN");
    }
    event.stopPropagation();
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user clicks on the copy address menu item.
   *
   * @param {object} event
   * @param {object|null} rec The current descriptor record from which the user wants to copy the address.
   */
  const handleCopyAddress = (event, rec) => {
    if (rec) {
      itemCopy(
        GetStreetAddress(rec.streetDescriptor, rec.localityName, rec.townName, rec.islandName),
        "Street address"
      );
    }
    event.stopPropagation();
    setAnchorEl(null);
  };

  /**
   * Method to do the copying of data.
   *
   * @param {string|null} text The text that needs to be copied.
   * @param {string} dataType The type of data that is being copied.
   */
  const itemCopy = (text, dataType) => {
    if (text) {
      copyTextToClipboard(text);
      if (onSetCopyOpen) onSetCopyOpen(true, dataType);
    }
  };

  /**
   * Event to handle adding a bookmark
   *
   */
  const handleBookmark = () => {
    setAnchorEl(null);
  };

  /**
   * Event to handle adding a street to a list.
   *
   */
  const handleAddToList = () => {
    setAnchorEl(null);
  };

  /**
   * Event to handle export
   *
   * @param {object} event
   */
  const handleExportTo = (event) => {
    setAnchorEl(null);
  };

  /**
   * Event to handle closing a street
   *
   */
  const handleCloseStreet = () => {
    setAnchorEl(null);
    streetContext.onCloseStreet(true);
  };

  /**
   * Event to handle deleting a street.
   *
   * @param {object} event
   */
  const handleDeleteStreet = (event) => {
    setOpenDeleteConfirmation(true);
    handleActionsMenuClose(event);
  };

  /**
   * Event to handle the closing of the delete confirmation dialog.
   *
   * @param {boolean} deleteConfirmed If true the delete was confirmed.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    const pkId = data && data.pkId ? data.pkId : -1;

    if (deleteConfirmed && pkId && pkId > 0 && onDelete) {
      onDelete(pkId);
    }
  };

  /**
   * Get the style for the language style
   *
   * @param {number} recId The id for the descriptor record that we are getting the style for.
   * @return {object} The styling to use for the language chip.
   */
  function LanguageChipStyle(recId) {
    if (itemSelected && itemSelected.toString() === recId.toString())
      return {
        ml: theme.spacing(0.5),
        mr: theme.spacing(1),
        backgroundColor: adsBlueA,
        color: adsWhite,
      };
    else
      return {
        ml: theme.spacing(0.5),
        mr: theme.spacing(1),
        "&:hover": {
          backgroundColor: adsBlueA,
          color: adsWhite,
        },
      };
  }

  /**
   * Gets the descriptor style.
   *
   * @param {number} index The index of the record in the array.
   * @returns {object} The styling to use for the descriptor.
   */
  const getDescriptorStyle = (index) => {
    const defaultDescriptorStyle = {
      "&:hover": {
        backgroundColor: adsLightBlue10,
        color: adsBlueA,
      },
    };

    if (descriptorErrors && descriptorErrors.length > 0) {
      const descriptorRecordErrors = descriptorErrors.filter((x) => x.index === index);
      if (descriptorRecordErrors && descriptorRecordErrors.length > 0) {
        return {
          backgroundColor: adsRed10,
          "&:hover": {
            backgroundColor: adsRed20,
            color: adsBlueA,
          },
        };
      } else return defaultDescriptorStyle;
    } else return defaultDescriptorStyle;
  };

  useEffect(() => {
    if (data) {
      setUsrn(data.usrn ? data.usrn : 0);
      setStreetType(data.recordType);
      setState(data.state);
      setStateDate(data.stateDate);
      setClassification(data.streetClassification);
      setSurface(data.streetSurface);
      setEastingStart(data.streetStartX ? data.streetStartX : 0);
      setNorthingStart(data.streetStartY ? data.streetStartY : 0);
      setEastingEnd(data.streetEndX ? data.streetEndX : 0);
      setNorthingEnd(data.streetEndY ? data.streetEndY : 0);
      setTolerance(data.streetTolerance ? data.streetTolerance : 0);
      setExcludeFromExport(data.neverExport ? data.neverExport : false);
      setStartDate(data.streetStartDate);
      setEndDate(data.streetEndDate);

      setStreetTypeLookup(FilteredStreetType(settingsContext.isScottish));

      let associatedRecords = [];
      if (data.streetDescriptors && data.streetDescriptors.length > 0)
        associatedRecords.push({
          type: "descriptor",
          count: data.streetDescriptors.length,
        });
      if (data.esus && data.esus.length > 0) {
        associatedRecords.push({
          type: "ESU",
          count: data.esus.length,
        });
        let hdCount = 0;
        let oweCount = 0;

        data.esus.forEach((esu) => {
          hdCount += esu.highwayDedications ? esu.highwayDedications.length : 0;
          oweCount += esu.oneWayExemptions ? esu.oneWayExemptions.length : 0;
        });

        if (hdCount > 0)
          associatedRecords.push({
            type: "highway dedication",
            count: hdCount,
          });
        if (oweCount > 0)
          associatedRecords.push({
            type: "one-way exemption",
            count: oweCount,
          });
      }
      if (HasASD()) {
        if (data.interests && data.interests.length > 0)
          associatedRecords.push({
            type: "interested organisation",
            count: data.interests.length,
          });
        if (data.constructions && data.constructions.length > 0)
          associatedRecords.push({
            type: "construction",
            count: data.constructions.length,
          });
        if (data.specialDesignations && data.specialDesignations.length > 0)
          associatedRecords.push({
            type: "special designation",
            count: data.specialDesignations.length,
          });
        if (data.heightWidthWeights && data.heightWidthWeights.length > 0)
          associatedRecords.push({
            type: "height, width and weight restriction",
            count: data.heightWidthWeights.length,
          });
        if (data.publicRightOfWays && data.publicRightOfWays.length > 0)
          associatedRecords.push({
            type: "public right of way",
            count: data.publicRightOfWays.length,
          });
      }
      if (data.streetNotes && data.streetNotes.length > 0)
        associatedRecords.push({
          type: "note",
          count: data.streetNotes.length,
        });

      if (associatedRecords.length > 0) setStreetAssociatedRecords(associatedRecords);
      else setStreetAssociatedRecords(null);
    }
  }, [data, settingsContext]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);

    setAdminUser(userContext.currentUser && userContext.currentUser.isAdministrator);
  }, [userContext]);

  useEffect(() => {
    setUsrnError(null);
    setStreetTypeError(null);
    setAuthorityError(null);
    setStateError(null);
    setStateDateError(null);
    setClassificationError(null);
    setSurfaceError(null);
    setStartEastingError(null);
    setStartNorthingError(null);
    setEndEastingError(null);
    setEndNorthingError(null);
    setToleranceError(null);
    setExcludeFromExportError(null);
    setStartDateError(null);
    setEndDateError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field) {
          case "Usrn":
            setUsrnError(error.errors);
            break;

          case "RecordType":
            setStreetTypeError(error.errors);
            break;

          case "SwaOrgRefNaming":
            setAuthorityError(error.errors);
            break;

          case "State":
            setStateError(error.errors);
            break;

          case "StateDate":
            setStateDateError(error.errors);
            break;

          case "StreetClassification":
            setClassificationError(error.errors);
            break;

          case "StreetSurface":
            setSurfaceError(error.errors);
            break;

          case "StreetStartX":
            setStartEastingError(error.errors);
            break;

          case "StreetStartY":
            setStartNorthingError(error.errors);
            break;

          case "StreetEndX":
            setEndEastingError(error.errors);
            break;

          case "StreetEndY":
            setEndNorthingError(error.errors);
            break;

          case "StreetTolerance":
            setToleranceError(error.errors);
            break;

          case "NeverExport":
            setExcludeFromExportError(error.errors);
            break;

          case "StreetStartDate":
            setStartDateError(error.errors);
            break;

          case "StreetEndDate":
            setEndDateError(error.errors);
            break;

          default:
            break;
        }
      }
    }
  }, [errors]);

  return (
    <Fragment>
      <Box sx={toolbarStyle}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ pl: theme.spacing(1.5) }}>{`${streetToTitleCase(
            streetContext.currentStreet.descriptor
          )}: ${streetContext.currentStreet.usrn}`}</Typography>
          <Tooltip title="Actions" arrow placement="right" sx={tooltipStyle}>
            <IconButton onClick={handleActionsClick} aria_controls="actions-menu" aria-haspopup="true" size="small">
              <ActionsIcon sx={ActionIconStyle()} />
            </IconButton>
          </Tooltip>
          <Menu
            id="actions-menu"
            elevation={2}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleActionsMenuClose}
            TransitionComponent={Fade}
            sx={menuStyle}
          >
            {((data && data.streetDescriptors && data.streetDescriptors.length === 0) ||
              ((settingsContext.isWelsh || settingsContext.isScottish) &&
                data &&
                data.streetDescriptors &&
                data.streetDescriptors.length === 1)) && (
              <MenuItem dense disabled onClick={handleAddLanguage} sx={menuItemStyle(false)}>
                <Typography variant="inherit">Add language version</Typography>
              </MenuItem>
            )}
            <MenuItem dense disabled={!userCanEdit} onClick={handleAddProperty} sx={menuItemStyle(true)}>
              <Typography variant="inherit">Add property on street</Typography>
            </MenuItem>
            <MenuItem dense disabled={!userCanEdit} divider onClick={handleAddRange} sx={menuItemStyle(true)}>
              <Typography variant="inherit">Add properties</Typography>
            </MenuItem>
            <MenuItem dense onClick={handleZoomToStreet} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Zoom to this</Typography>
            </MenuItem>
            <MenuItem dense onClick={handleOpenInStreetview} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Open in Street View</Typography>
            </MenuItem>
            {process.env.NODE_ENV === "development" && (
              <MenuItem dense divider disabled onClick={handleViewPropertiesOnStreet} sx={menuItemStyle(true)}>
                <Typography variant="inherit">View properties on street</Typography>
              </MenuItem>
            )}
            <MenuItem dense onClick={handleCopyUsrn} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Copy USRN</Typography>
            </MenuItem>
            {process.env.NODE_ENV === "development" && (
              <MenuItem dense disabled onClick={handleBookmark} sx={menuItemStyle(false)}>
                <Typography variant="inherit">Bookmark</Typography>
              </MenuItem>
            )}
            {process.env.NODE_ENV === "development" && (
              <MenuItem dense disabled onClick={handleAddToList} sx={menuItemStyle(false)}>
                <Typography variant="inherit">Add to list</Typography>
              </MenuItem>
            )}
            {process.env.NODE_ENV === "development" && (
              <MenuItem dense divider disabled onClick={handleExportTo} sx={menuItemStyle(true)}>
                <Typography variant="inherit">Export to...</Typography>
              </MenuItem>
            )}
            <MenuItem dense disabled={!userCanEdit} onClick={handleCloseStreet} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Close street</Typography>
            </MenuItem>
            {process.env.NODE_ENV === "development" && !settingsContext.isScottish && (
              <MenuItem dense disabled={!userCanEdit} onClick={handleDeleteStreet} sx={menuItemStyle(false)}>
                <Typography variant="inherit" color="error">
                  Delete
                </Typography>
              </MenuItem>
            )}
          </Menu>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("77.7vh")}>
        <Grid container justifyContent="flex-start" alignItems="baseline" sx={FormRowStyle()}>
          <Grid item xs={3}>
            <Typography variant="body2" color="textPrimary" align="left">
              Street descriptor*
            </Typography>
          </Grid>
          <Grid item xs={9}>
            {loading ? (
              <Skeleton variant="rectangular" height="30px" width="100%" />
            ) : data && data.streetDescriptors && data.streetDescriptors.length > 0 ? (
              data.streetDescriptors.map((rec, index) => (
                <List
                  sx={{
                    width: "100%",
                    pt: theme.spacing(0),
                  }}
                  component="nav"
                  key={`key_${index}`}
                >
                  <ListItemButton
                    dense
                    disableGutters
                    sx={getDescriptorStyle(index)}
                    onClick={() => handleOpenDescriptor(rec.pkId, index)}
                    onMouseEnter={() => handleMouseEnter(rec.pkId)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <ListItemIcon>
                      <Chip size="small" label={rec.language} sx={LanguageChipStyle(rec.pkId)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {GetStreetAddress(rec.streetDescriptor, rec.localityName, rec.townName, rec.islandName)}
                        </Typography>
                      }
                    />
                    <ListItemAvatar
                      sx={{
                        minWidth: 32,
                      }}
                    >
                      {itemSelected && itemSelected.toString() === rec.pkId.toString() && (
                        <Fragment>
                          <Tooltip title="Copy address to clipboard" arrow placement="bottom" sx={tooltipStyle}>
                            <IconButton onClick={(event) => handleCopyAddress(event, rec)} size="small">
                              <CopyIcon sx={ActionIconStyle()} />
                            </IconButton>
                          </Tooltip>
                          {((data && data.streetDescriptors && data.streetDescriptors.length === 0) ||
                            ((settingsContext.isWelsh || settingsContext.isScottish) &&
                              data &&
                              data.streetDescriptors &&
                              data.streetDescriptors.length === 1)) && (
                            <Tooltip title="Add language version" arrow placement="bottom" sx={tooltipStyle}>
                              <IconButton onClick={handleAddLanguage} disabled={!userCanEdit} size="small">
                                <AddCircleIcon sx={ActionIconStyle()} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Fragment>
                      )}
                    </ListItemAvatar>
                  </ListItemButton>
                </List>
              ))
            ) : (
              <List
                sx={{
                  width: "100%",
                  pt: theme.spacing(0),
                }}
                component="nav"
                key="key_no_records"
              >
                <ListItemButton
                  dense
                  disableGutters
                  onClick={handleAddLanguage}
                  sx={{
                    height: "30px",
                    "&:hover": {
                      backgroundColor: adsLightBlue10,
                      color: adsBlueA,
                    },
                  }}
                >
                  <ListItemText primary={<Typography variant="subtitle1">No descriptor records present</Typography>} />
                  <ListItemAvatar
                    sx={{
                      minWidth: 32,
                    }}
                  >
                    <Tooltip title="Add language version" arrow placement="bottom" sx={tooltipStyle}>
                      <IconButton onClick={handleAddLanguage} size="small">
                        <AddCircleIcon sx={ActionIconStyle()} />
                      </IconButton>
                    </Tooltip>
                  </ListItemAvatar>
                </ListItemButton>
              </List>
            )}
          </Grid>
        </Grid>
        <ADSNumberControl
          label="USRN"
          isEditable={adminUser}
          isRequired
          isFocused={focusedField ? focusedField === "Usrn" : false}
          loading={loading}
          value={usrn}
          errorText={usrnError}
          helperText="This is the USRN for the street."
          onChange={handleUSRNChangeEvent}
        />
        <ADSSelectControl
          label="Type"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "RecordType" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={streetTypeLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(settingsContext.isScottish)}
          lookupColour="colour"
          value={streetType}
          errorText={streetTypeError}
          onChange={handleStreetTypeChangeEvent}
          helperText="This is the type of the street."
        />
        <ADSSelectControl
          label="Authority"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "SwaOrgRefNaming" : false}
          loading={loading}
          useRounded
          lookupData={DETRCodes}
          lookupId="id"
          lookupLabel="text"
          value={authority}
          errorText={authorityError}
          onChange={handleAuthorityChangeEvent}
          helperText="The SNN Authority, or the Local Highway Authority if a RECORD_TYPE = 3 - numbered Street."
        />
        {!settingsContext.isScottish && (
          <ADSSelectControl
            label="State"
            isEditable={userCanEdit}
            isRequired
            doNotSetTitleCase
            loading={loading}
            isFocused={focusedField ? focusedField === "State" : false}
            useRounded
            lookupData={StreetState}
            lookupId="id"
            lookupLabel={GetLookupLabel(settingsContext.isScottish)}
            lookupColour="colour"
            value={state}
            errorText={stateError}
            helperText="This is the current state of the street."
            onChange={handleStateChangeEvent}
          />
        )}
        {!settingsContext.isScottish && (
          <ADSDateControl
            label="State start date"
            isEditable={userCanEdit}
            isRequired
            loading={loading}
            isFocused={focusedField ? focusedField === "StateDate" : false}
            value={stateDate}
            helperText="The date that the current state started."
            errorText={stateDateError}
            onChange={handleStateDateChangeEvent}
          />
        )}
        {!settingsContext.isScottish && (
          <ADSSelectControl
            label="Classification"
            isEditable={userCanEdit}
            doNotSetTitleCase
            loading={loading}
            isFocused={focusedField ? focusedField === "StreetClassification" : false}
            useRounded
            lookupData={StreetClassification}
            lookupId="id"
            lookupLabel={GetLookupLabel(settingsContext.isScottish)}
            lookupColour="colour"
            value={classification}
            errorText={classificationError}
            helperText="This is the current classification of the street."
            onChange={handleClassificationChangeEvent}
          />
        )}
        {!settingsContext.isScottish && (
          <ADSSelectControl
            label="Surface"
            isEditable={userCanEdit}
            isRequired
            doNotSetTitleCase
            loading={loading}
            isFocused={focusedField ? focusedField === "StreetSurface" : false}
            useRounded
            lookupData={StreetSurface}
            lookupId="id"
            lookupLabel={GetLookupLabel(settingsContext.isScottish)}
            lookupColour="colour"
            value={surface}
            errorText={surfaceError}
            helperText="This is the type of surface used for the majority of the street."
            onChange={handleSurfaceChangeEvent}
          />
        )}
        {!settingsContext.isScottish && (
          <ADSCoordinateControl
            label="Start grid reference"
            isEditable={userCanEdit}
            isRequired
            isEastFocused={focusedField ? focusedField === "StreetStartX" : false}
            isNorthFocused={focusedField ? focusedField === "StreetStartY" : false}
            displayButton
            loading={loading}
            eastErrorText={startEastingError}
            northErrorText={startNorthingError}
            helperText="The coordinates for the start of the street."
            eastValue={eastingStart}
            northValue={northingStart}
            eastLabel="Easting:"
            northLabel="Northing:"
            buttonLabel="Select start"
            onEastChange={handleEastingStartChangeEvent}
            onNorthChange={handleNorthingStartChangeEvent}
            onButtonClick={handleSelectStartClickEvent}
          />
        )}
        {!settingsContext.isScottish && (
          <ADSCoordinateControl
            label="End grid reference"
            isEditable={userCanEdit}
            isRequired
            isEastFocused={focusedField ? focusedField === "StreetEndX" : false}
            isNorthFocused={focusedField ? focusedField === "StreetEndY" : false}
            displayButton
            loading={loading}
            eastErrorText={endEastingError}
            northErrorText={endNorthingError}
            helperText="The coordinates for the end of the street."
            eastValue={eastingEnd}
            northValue={northingEnd}
            eastLabel="Easting:"
            northLabel="Northing:"
            buttonLabel="Select end"
            onEastChange={handleEastingEndChangeEvent}
            onNorthChange={handleNorthingEndChangeEvent}
            onButtonClick={handleSelectEndClickEvent}
          />
        )}
        {!settingsContext.isScottish && (
          <ADSNumberControl
            label="Tolerance (meters)"
            isEditable={userCanEdit}
            loading={loading}
            isFocused={focusedField ? focusedField === "StreetTolerance" : false}
            value={tolerance}
            errorText={toleranceError}
            helperText="This is the tolerance for the coordinates of the street."
            onChange={handleToleranceChangeEvent}
          />
        )}
        <ADSSwitchControl
          label="Exclude from export"
          isEditable={userCanEdit}
          loading={loading}
          isFocused={focusedField ? focusedField === "NeverExport" : false}
          checked={excludeFromExport}
          trueLabel="Yes"
          falseLabel="No"
          errorText={excludeFromExportError}
          helperText="Set this if you do not want this street to be included in any exports."
          onChange={handleExcludeFromExportChangeEvent}
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          loading={loading}
          isFocused={focusedField ? focusedField === "StreetStartDate" : false}
          value={startDate}
          helperText="The date that the street started."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        {(settingsContext.isScottish || state === 4) && (
          <ADSDateControl
            label="End date"
            isEditable={userCanEdit}
            isRequired={!settingsContext.isScottish && state === 4}
            loading={loading}
            isFocused={focusedField ? focusedField === "StreetEndDate" : false}
            value={endDate}
            helperText="The date that the street ceased to exist in the 'Real World'."
            errorText={endDateError}
            onChange={handleEndDateChangeEvent}
          />
        )}
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant="street"
          open={openDeleteConfirmation}
          associatedRecords={streetAssociatedRecords}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
    </Fragment>
  );
}

export default StreetDataTab;
