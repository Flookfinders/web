/* #region header */
/**************************************************************************************************
//
//  Description: Related Property tab
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
//    003   18.04.23 Sean Flook         WI40685 Modified call to ADSSelectionControl.
//    004   30.06.23 Sean Flook                 Ensure the current property is initially in view.
//    005   24.07.23 Sean Flook                 Removed Edit property menu item.
//    006   20.07.23 Sean Flook                 Added ability to display the property in Google street view.
//    007   06.10.23 Sean Flook                 Use colour variables.
//    007   10.10.23 Sean Flook       IMANN-163 Changes required for opening the tab after the property wizard.
//    008   27.10.23 Sean Flook       IMANN-175 Changes required for multi-edit of properties.
//    009   03.11.23 Sean Flook                 Updated TreeView and TreeItem.
//    010   20.11.23 Sean Flook                 Tweak the classification code for street BLPUs.
//    011   20.11.23 Sean Flook                 Undone above change.
//    012   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and fixed some warnings.
//    013   29.11.23 Sean Flook       IMANN-163 Added id's to the TreeItem to remove warning and corrected expanded data type.
//    014   05.01.24 Sean Flook                 Changes to sort out warnings.
//    015   10.01.24 Sean Flook                 Fix warnings.
//    016   11.01.24 Sean Flook                 Fix warnings.
//    017   12.01.24 Sean Flook                 Fixed duplicate key warning.
//    018   25.01.24 Sean Flook                 Changes required after UX review.
//    019   06.02.24 Joel Benford               Change flavour of light blue
//    020   07.02.24 Joel Benford               Spacing and colours
//    021   08.02.24 Joel Benford     RTAB3     Supply null street state to classification icon tooltip
//    022   14.02.24 Joel Benford     RTAB5     Interim check-in for comments
//    023   16.02.24 Sean Flook        ESU16_GP If changing page etc ensure the information and selection controls are cleared.
//    024   20.02.24 Sean Flook        ESU16_GP Undone above change as not required.
//    025   22.02.24 Joel Benford     IMANN-287 Checked items blue
//    026   01.03.24 Sean Flook           MUL16 Handle make child of.
//    027   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    028   12.03.24 Sean Flook            MUL8 Display an alert if properties are successfully moved.
//    029   13.03.24 Sean Flook            MUL9 Added new parameters to handle the checking of records.
//    030   18.03.24 Sean Flook           GLB12 Adjusted height to remove overflow.
//    031   19.03.24 Sean Flook       PRFRM2_GP Ensure onRelatedOpened is always called.
//    032   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    033   25.03.24 Sean Flook           MUL16 Removed option to remove from parent.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import PropertyContext from "../context/propertyContext";
import MapContext from "../context/mapContext";
import UserContext from "../context/userContext";
import StreetContext from "../context/streetContext";
import SettingsContext from "../context/settingsContext";
import SearchContext from "../context/searchContext";

import {
  Typography,
  Skeleton,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
  Chip,
  Checkbox,
  Popper,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import ADSSelectionControl from "../components/ADSSelectionControl";
import MakeChildDialog from "../dialogs/MakeChildDialog";

import { GetAvatarColour, GetAvatarTooltip, copyTextToClipboard, openInStreetView } from "./../utils/HelperUtils";
import { addressToTitleCase, GetPropertyMapData } from "./../utils/PropertyUtils";

import LPILogicalStatus from "./../data/LPILogicalStatus";

import GetClassificationIcon from "../utils/ADSClassificationIcons";
import { CopyIcon } from "../utils/ADSIcons";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MyLocationIcon from "@mui/icons-material/MyLocation";

import { adsBlueA, adsWhite, adsLightGreyB, adsPaleBlueA, adsLightGreyD } from "../utils/ADSColours";
import {
  dataFormStyle,
  ActionIconStyle,
  menuStyle,
  menuItemStyle,
  tooltipStyle,
  GetTabIconStyle,
  RelatedLanguageChipStyle,
  toolbarStyle,
  GetAlertStyle,
  GetAlertIcon,
  GetAlertSeverity,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

RelatedPropertyTab.propTypes = {
  data: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(["street", "property"]).isRequired,
  loading: PropTypes.bool.isRequired,
  expanded: PropTypes.array.isRequired,
  checked: PropTypes.array.isRequired,
  onNodeSelect: PropTypes.func.isRequired,
  onNodeToggle: PropTypes.func.isRequired,
  onChecked: PropTypes.func.isRequired,
  onSetCopyOpen: PropTypes.func.isRequired,
  onPropertyAdd: PropTypes.func.isRequired,
};

function RelatedPropertyTab({
  data,
  variant,
  loading,
  expanded,
  checked,
  onNodeSelect,
  onNodeToggle,
  onChecked,
  onSetCopyOpen,
  onPropertyAdd,
}) {
  const theme = useTheme();

  const propertyContext = useContext(PropertyContext);
  const mapContext = useContext(MapContext);
  const userContext = useContext(UserContext);
  const streetContext = useContext(StreetContext);
  const settingsContext = useContext(SettingsContext);
  const searchContext = useContext(SearchContext);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [propertySelected, setPropertySelected] = useState(null);
  const [propertyChecked, setPropertyChecked] = useState([]);
  const [anchorPropertyActionsEl, setAnchorPropertyActionsEl] = useState(null);
  const [anchorPropertyActionsEl2, setAnchorPropertyActionsEl2] = useState(null);
  const [anchorPropertyActionsEl3, setAnchorPropertyActionsEl3] = useState(null);
  const [anchorPropertyActionsEl4, setAnchorPropertyActionsEl4] = useState(null);
  const [anchorSelectEl, setAnchorSelectEl] = useState(null);

  const [selectionAnchorEl, setSelectionAnchorEl] = useState(null);
  const selectionOpen = Boolean(selectionAnchorEl);
  const selectionId = selectionOpen ? "list-selection-popper" : undefined;
  const checkedAddress = useRef(null);

  const [allChecked, setAllChecked] = useState(false);
  const [partialChecked, setPartialChecked] = useState(false);

  const [openMakeChild, setOpenMakeChild] = useState(false);
  const [makeChildUprn, setMakeChildUprn] = useState([]);

  const [alertOpen, setAlertOpen] = useState(false);
  const alertType = useRef("");

  /**
   * Event to handle when a node is selected.
   *
   * @param {object} event The event object.
   * @param {number} nodeId The id of the selected node.
   */
  function handleNodeSelected(event, nodeId) {
    event.persist();
    const iconClicked = event.target.closest(".MuiTreeItem-iconContainer");
    const checkboxClicked = event.target.closest(".MuiCheckbox-root");
    if (!iconClicked && !checkboxClicked && onNodeSelect) onNodeSelect("property", nodeId);
  }

  /**
   * Event to handle the toggling of the nodes.
   *
   * @param {object} event The event object.
   * @param {array} nodeIds The list of node ids that are expanded.
   */
  function handleNodeToggle(event, nodeIds) {
    event.persist();
    const iconClicked = event.target.closest(".MuiTreeItem-iconContainer");
    const checkboxClicked = event.target.closest(".MuiCheckbox-root");
    if (iconClicked && !checkboxClicked && onNodeToggle) onNodeToggle(nodeIds);
  }

  /**
   * Event to handle when the mouse enters a property node.
   *
   * @param {number} recId The id of the property the mouse has entered.
   */
  const handleMouseEnterProperty = (recId) => {
    if (recId !== "") setPropertySelected(recId);
  };

  /**
   * Event to handle when the mouse leaves a property node.
   */
  const handleMouseLeaveProperty = () => {
    setPropertySelected(null);
  };

  /**
   * Event to handle the toggling of the checkboxes.
   *
   * @param {object} event The event object.
   * @param {number} uprn The UPRN of the property.
   * @param {string} address The address for the property.
   */
  const handleCheckboxChange = (event, uprn, address) => {
    event.stopPropagation();
    const tempArray = [...propertyChecked];
    let settingCheck = false;
    if (!tempArray.includes(uprn)) {
      tempArray.push(uprn);
      settingCheck = true;
    } else tempArray.splice(tempArray.indexOf(uprn), 1);
    if (!event.nativeEvent.ctrlKey) {
      // Cascade down the tree
      const children = data.properties.filter((x) => x.parentUprn && x.parentUprn.toString() === uprn);
      if (children && children.length > 0) {
        for (const child of children) {
          if (settingCheck && !tempArray.includes(child.uprn.toString())) tempArray.push(child.uprn.toString());
          else if (!settingCheck) tempArray.splice(tempArray.indexOf(child.uprn.toString()), 1);
          const grandChildren = data.properties.filter(
            (x) => x.parentUprn && x.parentUprn.toString() === child.uprn.toString()
          );
          if (grandChildren && grandChildren.length > 0) {
            for (const grandChild of grandChildren) {
              if (settingCheck && !tempArray.includes(grandChild.uprn.toString()))
                tempArray.push(grandChild.uprn.toString());
              else if (!settingCheck) tempArray.splice(tempArray.indexOf(grandChild.uprn.toString()), 1);
              const greatGrandChildren = data.properties.filter(
                (x) => x.parentUprn && x.parentUprn.toString() === grandChild.uprn.toString()
              );
              if (greatGrandChildren && greatGrandChildren.length > 0) {
                for (const greatGrandChild of greatGrandChildren) {
                  if (settingCheck && !tempArray.includes(greatGrandChild.uprn.toString()))
                    tempArray.push(greatGrandChild.uprn.toString());
                  else if (!settingCheck) tempArray.splice(tempArray.indexOf(greatGrandChild.uprn.toString()), 1);
                }
              }
            }
          }
        }
      }
    }
    if (onChecked) onChecked(tempArray);
    else {
      setPropertyChecked(tempArray);
      setAllChecked(data.properties.length === tempArray.length);
      setPartialChecked(tempArray.length > 0 && data.properties.length > tempArray.length);
      setSelectionAnchorEl(tempArray.length > 0 ? document.getElementById("ads-related-toolbar") : null);
    }
    checkedAddress.current = address;
  };

  /**
   * Event to handle when the select checkbox is clicked.
   */
  const handleSelectCheckboxClick = () => {
    if (allChecked) {
      if (onChecked) onChecked([]);
      else {
        setPropertyChecked([]);
        setSelectionAnchorEl(null);
        setAllChecked(false);
        setPartialChecked(false);
        mapContext.onHighlightClear();
      }
    } else {
      const newChecked = data.properties.map((x) => x.uprn.toString());
      const propertyHighlighted = data.properties.map((x) => x.uprn);
      if (onChecked) onChecked(newChecked);
      else {
        setPropertyChecked(newChecked);
        setSelectionAnchorEl(document.getElementById("ads-related-toolbar"));
        setAllChecked(true);
        setPartialChecked(false);
      }
      mapContext.onHighlightStreetProperty(null, propertyHighlighted);
    }
  };

  /**
   * Event to handle when the select menu is clicked.
   *
   * @param {object} event The event object.
   */
  const handleSelectMenuClick = (event) => {
    setAnchorSelectEl(event.nativeEvent.target);
  };

  /**
   * Event to handle the closing of the select menu.
   */
  const handleSelectMenuClose = () => {
    setAnchorSelectEl(null);
  };

  /**
   * Event to handle selecting all the properties.
   */
  const handleSelectAll = () => {
    const newChecked = data.properties.map((x) => x.uprn.toString());
    const propertyHighlighted = data.properties.map((x) => x.uprn);
    if (onChecked) onChecked(newChecked);
    else {
      setPropertyChecked(newChecked);
      setAllChecked(true);
      setPartialChecked(false);
      setSelectionAnchorEl(document.getElementById("ads-related-toolbar"));
    }
    setAnchorSelectEl(null);
    mapContext.onHighlightStreetProperty(null, propertyHighlighted);
  };

  /**
   * Method to handle selecting all the properties by logical status.
   */
  const handleSelectLogicalStatus = (logicalStatus) => {
    const newChecked = data.properties
      .filter((x) => x.additional[0].logicalStatus === logicalStatus)
      .map((x) => x.uprn.toString());
    const propertyHighlighted = data.properties
      .filter((x) => x.additional[0].logicalStatus === logicalStatus)
      .map((x) => x.uprn);
    if (onChecked) onChecked(newChecked);
    else {
      setPropertyChecked(newChecked);
      setAllChecked(data.properties.length === newChecked.length);
      setPartialChecked(newChecked.length > 0 && data.properties.length > newChecked.length);
      setSelectionAnchorEl(newChecked.length > 0 ? document.getElementById("ads-related-toolbar") : null);
    }
    setAnchorSelectEl(null);
    mapContext.onHighlightStreetProperty(null, propertyHighlighted);
  };

  /**
   * Event to handle selecting all the provisional properties.
   */
  const handleSelectProvisional = () => {
    handleSelectLogicalStatus(6);
  };

  /**
   * Event to handle selecting all the approved properties.
   */
  const handleSelectApproved = () => {
    handleSelectLogicalStatus(1);
  };

  /**
   * Event to handle when the selection dialog closes.
   */
  const handleCloseSelection = () => {
    if (onChecked) onChecked([]);
    else {
      setPropertyChecked([]);
      setAllChecked(false);
      setPartialChecked(false);
      setSelectionAnchorEl(null);
    }
  };

  /**
   * Event to handle displaying the copy alert.
   *
   * @param {string} dataType The type of data that has been copied.
   */
  const handleSetCopyOpen = (dataType) => {
    if (onSetCopyOpen) onSetCopyOpen(true, dataType);
  };

  /**
   * Event to handle display the alert after moving seed points.
   */
  const handlePropertyMoved = () => {
    alertType.current = "propertyMoved";
    setAlertOpen(true);
  };

  /**
   * Method used to copy the text to the clipboard.
   *
   *
   * @param {object} event The event object.
   * @param {string|null} text The text that needs to be copied to the clipboard.
   * @param {string} dataType The type of data that is being copied to the clipboard.
   */
  const itemCopy = (event, text, dataType) => {
    event.stopPropagation();
    if (text) {
      copyTextToClipboard(text);
      if (onSetCopyOpen) onSetCopyOpen(true, dataType);
    }
  };

  /**
   * Method to make the record a child.
   *
   * @param {object} event The event object.
   * @param {object} rec The related record.
   */
  const handleMakeChildOf = (event, record) => {
    event.stopPropagation();

    if (record) {
      setMakeChildUprn([record.uprn]);
      setOpenMakeChild(true);
      searchContext.onHideSearch(true);
    }
  };

  /**
   * Event to handle when the make child of dialog closes.
   */
  const handleMakeChildClose = () => {
    setOpenMakeChild(false);
    searchContext.onHideSearch(false);
    setMakeChildUprn([]);
  };

  /**
   * Event to handle zooming the map to a property.
   *
   * @param {object} event The event object.
   * @param {number} uprn The UPRN of the property to zoom to.
   */
  const zoomToProperty = (event, uprn) => {
    event.stopPropagation();

    const found = mapContext.currentSearchData.properties.find((rec) => rec.uprn === uprn);

    if (found) {
      mapContext.onMapChange(mapContext.currentLayers.extents, null, uprn);
    }
  };

  /**
   * Method to get the required parent property data used when creating a child property.
   *
   * @param {object} propertyData The parent property data.
   * @returns {object} The parent property data required for creating a child property.
   */
  const getParentRecord = (propertyData) => {
    const engLpiData = propertyData.lpis
      .filter((x) => x.language === "ENG")
      .sort((a, b) => a.logicalStatus - b.logicalStatus);
    const cymLpiData = propertyData.lpis
      .filter((x) => x.language === "CYM")
      .sort((a, b) => a.logicalStatus - b.logicalStatus);
    const gaeLpiData = propertyData.lpis
      .filter((x) => x.language === "GAE")
      .sort((a, b) => a.logicalStatus - b.logicalStatus);

    const parent =
      cymLpiData && cymLpiData.length > 0 && engLpiData && engLpiData.length > 0
        ? {
            uprn: propertyData.uprn,
            rpc: propertyData.rpc,
            eng: {
              paoStartNumber: engLpiData[0].paoStartNumber,
              paoStartSuffix: engLpiData[0].paoStartSuffix,
              paoEndNumber: engLpiData[0].paoEndNumber,
              paoEndSuffix: engLpiData[0].paoEndSuffix,
              paoText: engLpiData[0].paoText,
              address: engLpiData[0].address,
              postTownRef: engLpiData[0].postTownRef,
              postcodeRef: engLpiData[0].postcodeRef,
              postTown: engLpiData[0].postTown,
              postcode: engLpiData[0].postcode,
            },
            cym: {
              paoStartNumber: cymLpiData[0].paoStartNumber,
              paoStartSuffix: cymLpiData[0].paoStartSuffix,
              paoEndNumber: cymLpiData[0].paoEndNumber,
              paoEndSuffix: cymLpiData[0].paoEndSuffix,
              paoText: cymLpiData[0].paoText,
              address: cymLpiData[0].address,
              postTownRef: cymLpiData[0].postTownRef,
              postcodeRef: cymLpiData[0].postcodeRef,
              postTown: cymLpiData[0].postTown,
              postcode: cymLpiData[0].postcode,
            },
          }
        : gaeLpiData && gaeLpiData.length > 0 && engLpiData && engLpiData.length > 0
        ? {
            uprn: propertyData.uprn,
            rpc: propertyData.rpc,
            eng: {
              paoStartNumber: engLpiData[0].paoStartNumber,
              paoStartSuffix: engLpiData[0].paoStartSuffix,
              paoEndNumber: engLpiData[0].paoEndNumber,
              paoEndSuffix: engLpiData[0].paoEndSuffix,
              paoText: engLpiData[0].paoText,
              address: engLpiData[0].address,
              postTownRef: engLpiData[0].postTownRef,
              postcodeRef: engLpiData[0].postcodeRef,
              postTown: engLpiData[0].postTown,
              postcode: engLpiData[0].postcode,
            },
            gae: {
              paoStartNumber: gaeLpiData[0].paoStartNumber,
              paoStartSuffix: gaeLpiData[0].paoStartSuffix,
              paoEndNumber: gaeLpiData[0].paoEndNumber,
              paoEndSuffix: gaeLpiData[0].paoEndSuffix,
              paoText: gaeLpiData[0].paoText,
              address: gaeLpiData[0].address,
              postTownRef: gaeLpiData[0].postTownRef,
              postcodeRef: gaeLpiData[0].postcodeRef,
              postTown: gaeLpiData[0].postTown,
              postcode: gaeLpiData[0].postcode,
            },
          }
        : engLpiData && engLpiData.length > 0
        ? {
            uprn: propertyData.uprn,
            rpc: propertyData.rpc,
            eng: {
              paoStartNumber: engLpiData[0].paoStartNumber,
              paoStartSuffix: engLpiData[0].paoStartSuffix,
              paoEndNumber: engLpiData[0].paoEndNumber,
              paoEndSuffix: engLpiData[0].paoEndSuffix,
              paoText: engLpiData[0].paoText,
              address: engLpiData[0].address,
              postTownRef: engLpiData[0].postTownRef,
              postcodeRef: engLpiData[0].postcodeRef,
              postTown: engLpiData[0].postTown,
              postcode: engLpiData[0].postcode,
            },
          }
        : null;

    return parent;
  };

  /**
   * Event to handle creating a child property.
   *
   * @param {object} event The event object.
   * @param {number} uprn The UPRN of the parent property.
   */
  async function HandleAddChild(event, uprn) {
    handlePropertyActionsMenuClose(event);
    handleChild1ActionsMenuClose(event);
    handleChild2ActionsMenuClose(event);
    handleChild3ActionsMenuClose(event);

    const propertyData = await GetPropertyMapData(uprn, userContext.currentUser.token);

    if (propertyData) {
      const parent = getParentRecord(propertyData);

      if (onPropertyAdd && parent) onPropertyAdd(propertyData.usrn, parent, false);
    }
  }

  /**
   * Event to handle creating a range of child properties.
   *
   * @param {object} event The event object.
   * @param {number} uprn The UPRN of the parent property.
   */
  const handleAddChildren = async (event, uprn) => {
    handlePropertyActionsMenuClose(event);
    handleChild1ActionsMenuClose(event);
    handleChild2ActionsMenuClose(event);
    handleChild3ActionsMenuClose(event);

    const propertyData = await GetPropertyMapData(uprn, userContext.currentUser.token);

    if (propertyData) {
      const parent = getParentRecord(propertyData);

      if (onPropertyAdd && parent) onPropertyAdd(propertyData.usrn, parent, true);
    }
  };

  /**
   * Display the street/property in Google Street View.
   *
   * @param {object} event The event object
   * @param {object} rec The record that needs to be displayed in Google Street View.
   */
  async function handleStreetViewClick(event, rec) {
    if (rec) {
      handlePropertyActionsMenuClose(event);
      if (rec.easting && rec.northing) openInStreetView([rec.easting, rec.northing]);
    }
  }

  /**
   * Event to handle when the property actions menu button is clicked.
   *
   * @param {object} event The event object.
   */
  const handlePropertyActionsMenuClick = (event) => {
    setAnchorPropertyActionsEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle closing the property actions menu.
   *
   * @param {object} event The event object.
   */
  const handlePropertyActionsMenuClose = (event) => {
    setAnchorPropertyActionsEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle when the child 1 actions menu button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleChild1ActionsMenuClick = (event) => {
    setAnchorPropertyActionsEl2(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle closing the child 1 actions menu.
   *
   * @param {object} event The event object.
   */
  const handleChild1ActionsMenuClose = (event) => {
    setAnchorPropertyActionsEl2(null);
    event.stopPropagation();
  };

  /**
   * Event to handle when the child 2 actions menu button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleChild2ActionsMenuClick = (event) => {
    setAnchorPropertyActionsEl3(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle closing the child 2 actions menu.
   *
   * @param {object} event The event object.
   */
  const handleChild2ActionsMenuClose = (event) => {
    setAnchorPropertyActionsEl3(null);
    event.stopPropagation();
  };

  /**
   * Event to handle when the child 3 actions menu button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleChild3ActionsMenuClick = (event) => {
    setAnchorPropertyActionsEl4(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle closing the child 3 actions menu.
   *
   * @param {object} event The event object.
   */
  const handleChild3ActionsMenuClose = (event) => {
    setAnchorPropertyActionsEl4(null);
    event.stopPropagation();
  };

  /**
   * Method to get the styling for stack holding language chip + address.
   *
   * @returns {object} The styling to be used for the stack.
   */
  function LanguageAddressPairStyle() {
    // return {};
    return { mb: theme.spacing(1) };
  }

  /**
   * Method to get the styling to be used for the language chip.
   *
   * @param {number} status The logical status of the property.
   * @returns {object} The styling to be used for the language chip.
   */
  function PropertyLanguageChipStyle(status) {
    const logicalStatusRec = LPILogicalStatus.filter((x) => x.id === status);
    return RelatedLanguageChipStyle(logicalStatusRec ? logicalStatusRec[0].colour : "");
  }

  /**
   * Method to get the styling to be used for the address.
   *
   * @param {boolean} selected True if the node is selected; otherwise false.
   * @returns {object} The styling to use for the address.
   */
  function AddressStyle(selected) {
    if (selected) {
      return { display: "inline-flex", fontWeight: "bold" };
    } else {
      return { display: "inline-flex" };
    }
  }

  /**
   * Method to generate the add menu items.
   *
   * @param {object} record The current property record.
   * @param {number} id The id for the current property.
   * @param {JSX.Element} anchorEl The element to anchor the menu to.
   * @param {event} handleClose The event to use when closing the menu.
   * @returns {JSX.Element} The menu element.
   */
  function AddMenuItems(record, id, anchorEl, handleClose) {
    return (
      <Menu
        id={id}
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
        onClose={handleClose}
        sx={menuStyle}
      >
        {process.env.NODE_ENV === "development" && (
          <MenuItem
            dense
            disabled={!userCanEdit}
            onClick={(event) => HandleAddChild(event, record.uprn)}
            sx={menuItemStyle(false)}
          >
            <Typography variant="inherit">Add child</Typography>
          </MenuItem>
        )}
        {process.env.NODE_ENV === "development" && (
          <MenuItem
            dense
            disabled={!userCanEdit}
            onClick={(event) => handleAddChildren(event, record.uprn)}
            sx={menuItemStyle(false)}
          >
            <Typography variant="inherit">Add children</Typography>
          </MenuItem>
        )}
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense divider disabled sx={menuItemStyle(true)}>
            <Typography variant="inherit">Add children</Typography>
          </MenuItem>
        )}
        <MenuItem dense onClick={(event) => handleStreetViewClick(event, record)} sx={menuItemStyle(false)}>
          <Typography variant="inherit">Open in Street View</Typography>
        </MenuItem>
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense disabled sx={menuItemStyle(false)}>
            <Typography variant="inherit">Search nearby</Typography>
          </MenuItem>
        )}
        <MenuItem dense onClick={(event) => zoomToProperty(event, record.uprn)} sx={menuItemStyle(false)}>
          <Typography variant="inherit">Zoom to this</Typography>
        </MenuItem>
        <MenuItem
          dense
          divider
          onClick={(event) => itemCopy(event, record.uprn.toString(), "UPRN")}
          sx={menuItemStyle(true)}
        >
          <Typography variant="inherit">Copy UPRN</Typography>
        </MenuItem>
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense disabled sx={menuItemStyle(false)}>
            <Typography variant="inherit">Bookmark</Typography>
          </MenuItem>
        )}
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense disabled sx={menuItemStyle(false)}>
            <Typography variant="inherit">Add to list</Typography>
          </MenuItem>
        )}
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense divider disabled sx={menuItemStyle(true)}>
            <Typography variant="inherit">Export to...</Typography>
          </MenuItem>
        )}
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense disabled sx={menuItemStyle(false)}>
            <Typography variant="inherit">Move street</Typography>
          </MenuItem>
        )}
        <MenuItem dense onClick={(event) => handleMakeChildOf(event, record)} sx={menuItemStyle(false)}>
          <Typography variant="inherit">Make child of...</Typography>
        </MenuItem>
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense divider disabled sx={menuItemStyle(true)}>
            <Typography variant="inherit">Move seed point</Typography>
          </MenuItem>
        )}
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense disabled sx={menuItemStyle(false)}>
            <Typography variant="inherit">Reject</Typography>
          </MenuItem>
        )}
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense disabled sx={menuItemStyle(false)}>
            <Typography variant="inherit">Historicise</Typography>
          </MenuItem>
        )}
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense disabled sx={menuItemStyle(false)}>
            <Typography variant="inherit" color="secondary">
              Delete
            </Typography>
          </MenuItem>
        )}
      </Menu>
    );
  }

  /**
   * Method used to style the tree items by whether they are checked and/or current.
   *
   * @param {number} uprn Uprn for the tree item.
   * @returns {object} The styling to use for the tree item.
   */
  const treeItemStyle = (uprn) => {
    const currentProperty = uprn.toString() === propertyContext.currentProperty.uprn.toString();
    const checked = propertyChecked.includes(uprn.toString());
    if (currentProperty)
      return {
        backgroundColor: checked ? adsPaleBlueA : adsWhite,
        borderBottom: `solid ${adsLightGreyB} 1px`,
        pb: theme.spacing(1),
        pt: theme.spacing(1),
        "&:hover": {
          backgroundColor: adsPaleBlueA,
          borderRight: `solid ${adsLightGreyD} 3px`,
          color: adsBlueA,
        },
      };
    else
      return {
        backgroundColor: checked ? adsPaleBlueA : "inherit",
        borderBottom: `solid ${adsLightGreyB} 1px`,
        pb: theme.spacing(1),
        pt: theme.spacing(1),
        "&:hover": {
          backgroundColor: adsPaleBlueA,
          borderRight: `solid ${adsLightGreyD} 3px`,
          color: adsBlueA,
        },
      };
  };

  /**
   * Method used to get property information for a given property.
   *
   * @param {number} propertyId The UPRN of the property that we want the information from.
   * @returns {object|null} The required property information.
   */
  const getPropertyFromId = (propertyId) => {
    const property = data.properties.filter((x) => x.uprn === propertyId);
    if (property && property.length === 1)
      return { id: property[0].uprn, logical_status: property[0].primary.logicalStatus };
    else return null;
  };

  /**
   * Event to handle when the alert closes.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the alert is closing.
   * @returns
   */
  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertOpen(false);
  };

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    setPropertyChecked(checked);
    if (data && data.properties) {
      setAllChecked(data.properties.length === checked.length);
      setPartialChecked(checked.length > 0 && data.properties.length > checked.length);
    }
    setSelectionAnchorEl(checked.length > 0 ? document.getElementById("ads-related-toolbar") : null);
  }, [checked, data]);

  useEffect(() => {
    if (streetContext.currentStreet.openRelated) {
      if (document.getElementById(`property-related-tree-${streetContext.currentStreet.openRelated.toString()}`)) {
        document
          .getElementById(`property-related-tree-${streetContext.currentStreet.openRelated.toString()}`)
          .scrollIntoView();
        streetContext.onRelatedOpened();
      }
    } else if (propertyContext.currentProperty.openRelated) {
      if (!expanded || expanded.length === 0) {
        if (
          propertyContext.currentProperty.openRelated.topNodeId &&
          document.getElementById(propertyContext.currentProperty.openRelated.topNodeId) &&
          onNodeToggle
        )
          onNodeToggle(propertyContext.currentProperty.openRelated.expandList);
      } else if (
        propertyContext.currentProperty.openRelated.property &&
        document.getElementById(
          `property-related-tree-${propertyContext.currentProperty.openRelated.property.toString()}`
        )
      ) {
        document
          .getElementById(`property-related-tree-${propertyContext.currentProperty.openRelated.property.toString()}`)
          .scrollIntoView();
      }
      propertyContext.onRelatedOpened();
    } else if (
      propertyContext.currentProperty.uprn &&
      propertyContext.currentProperty.uprn > 0 &&
      document.getElementById(`property-related-tree-${propertyContext.currentProperty.uprn.toString()}`)
    )
      document
        .getElementById(`property-related-tree-${propertyContext.currentProperty.uprn.toString()}`)
        .scrollIntoView();
  }, [streetContext, propertyContext, expanded, onNodeToggle]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id="ads-related-property-toolbar">
        <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
          <Tooltip title="Toggle select all / none" arrow placement="right" sx={tooltipStyle}>
            <Fragment>
              <Checkbox
                sx={{
                  pr: theme.spacing(0),
                  pl: theme.spacing(2.5),
                }}
                checked={allChecked}
                color="primary"
                indeterminate={partialChecked}
                onClick={handleSelectCheckboxClick}
              />
              <IconButton
                sx={{
                  pl: theme.spacing(0),
                }}
                onClick={handleSelectMenuClick}
                aria-controls="select-menu"
                aria-haspopup="true"
                size="small"
              >
                <ExpandMoreIcon sx={ActionIconStyle()} />
              </IconButton>
            </Fragment>
          </Tooltip>
          <Menu
            id="related-property-select-menu"
            elevation={2}
            anchorEl={anchorSelectEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
            keepMounted
            open={Boolean(anchorSelectEl)}
            onClose={handleSelectMenuClose}
            sx={menuStyle}
          >
            <MenuItem dense onClick={handleSelectAll} sx={menuItemStyle(false)}>
              <Typography
                variant="inherit"
                sx={{
                  pl: theme.spacing(1),
                }}
              >
                All
              </Typography>
            </MenuItem>
            <MenuItem dense onClick={handleSelectProvisional} sx={menuItemStyle(false)}>
              <Typography
                variant="inherit"
                sx={{
                  pl: theme.spacing(1),
                }}
              >
                Provisional
              </Typography>
            </MenuItem>
            <MenuItem dense onClick={handleSelectApproved} sx={menuItemStyle(false)}>
              <Typography
                variant="inherit"
                sx={{
                  pl: theme.spacing(1),
                }}
              >
                Approved
              </Typography>
            </MenuItem>
          </Menu>
        </Stack>
      </Box>
      <Box sx={dataFormStyle(`${variant === "street" ? "StreetRelatedPropertyTab" : "PropertyRelatedPropertyTab"}`)}>
        {loading ? (
          <Skeleton variant="rectangular" height="30px" width="100%" />
        ) : (
          <TreeView
            sx={{ flexGrow: 1, overflowY: "auto" }}
            aria-label="property related tree"
            id="property-related-tree"
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            expanded={expanded}
            onNodeSelect={handleNodeSelected}
            onNodeToggle={handleNodeToggle}
          >
            {data &&
              data.properties &&
              data.properties.length > 0 &&
              data.properties
                .filter((x) => !x.parentUprn)
                .sort(function (a, b) {
                  return a.primary.address && b.primary.address
                    ? a.primary.address.localeCompare(b.primary.address, undefined, {
                        numeric: true,
                        sensitivity: "base",
                      })
                    : 0;
                })
                .map((rec) => {
                  // console.log("[SF] property", rec);
                  return (
                    <TreeItem
                      key={rec.uprn}
                      nodeId={rec.uprn.toString()}
                      sx={treeItemStyle(rec.uprn)}
                      label={
                        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
                            {data.properties && data.properties.filter((x) => x.parentUprn === rec.uprn).length > 0 ? (
                              <Avatar
                                variant="rounded"
                                sx={GetTabIconStyle(
                                  data.properties && data.properties
                                    ? data.properties.filter((x) => x.parentUprn === rec.uprn).length
                                    : 0
                                )}
                              >
                                <Typography variant="caption">
                                  <strong>
                                    {data.properties && data.properties
                                      ? data.properties.filter((x) => x.parentUprn === rec.uprn).length
                                      : 0}
                                  </strong>
                                </Typography>
                              </Avatar>
                            ) : (
                              <Box sx={{ width: "24px" }} />
                            )}
                            {(propertySelected && propertySelected === rec.uprn) ||
                            propertyChecked.includes(rec.uprn.toString()) ? (
                              <Checkbox
                                sx={{
                                  pl: theme.spacing(0),
                                  pr: theme.spacing(0),
                                }}
                                checked={propertyChecked.includes(rec.uprn.toString())}
                                onChange={(event) =>
                                  handleCheckboxChange(event, rec.uprn.toString(), rec.primary.address)
                                }
                              />
                            ) : (
                              <Box sx={{ width: "24px" }} />
                            )}
                            <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="flex-start">
                              <Tooltip
                                title={GetAvatarTooltip(
                                  24,
                                  rec.primary.logicalStatus,
                                  rec.blpuClass ? rec.blpuClass : "R",
                                  null,
                                  settingsContext.isScottish
                                )}
                                arrow
                                placement="bottom"
                                sx={tooltipStyle}
                              >
                                {GetClassificationIcon(
                                  rec.blpuClass ? rec.blpuClass : "R",
                                  GetAvatarColour(rec.primary.logicalStatus)
                                )}
                              </Tooltip>
                              <Stack direction="column">
                                <Stack direction="row" spacing={1} sx={LanguageAddressPairStyle()}>
                                  <Chip
                                    size="small"
                                    label={rec.primary.language}
                                    sx={PropertyLanguageChipStyle(rec.primary.logicalStatus)}
                                  />
                                  <Typography
                                    variant="subtitle2"
                                    sx={AddressStyle(
                                      rec.uprn.toString() === propertyContext.currentProperty.uprn.toString()
                                    )}
                                  >
                                    {addressToTitleCase(rec.primary.address, rec.primary.postcode)}
                                  </Typography>
                                </Stack>
                                {rec.additional.map((recAdd) => {
                                  return (
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={LanguageAddressPairStyle()}
                                      key={recAdd.lpiKey}
                                    >
                                      <Chip
                                        size="small"
                                        label={recAdd.language}
                                        sx={PropertyLanguageChipStyle(recAdd.logicalStatus)}
                                      />
                                      <Typography
                                        variant="subtitle2"
                                        sx={AddressStyle(
                                          rec.uprn.toString() === propertyContext.currentProperty.uprn.toString()
                                        )}
                                      >
                                        {addressToTitleCase(recAdd.address, recAdd.postcode)}
                                      </Typography>
                                    </Stack>
                                  );
                                })}
                              </Stack>
                            </Stack>
                          </Stack>
                          {propertySelected &&
                            propertySelected === rec.uprn &&
                            propertyChecked &&
                            propertyChecked.length < 2 && (
                              <Stack direction="row" justifyContent="flex-end" alignItems="center">
                                <Tooltip title="Copy UPRN" arrow placement="bottom" sx={tooltipStyle}>
                                  <IconButton
                                    onClick={(event) => itemCopy(event, rec.uprn.toString(), "UPRN")}
                                    size="small"
                                  >
                                    <CopyIcon sx={ActionIconStyle()} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Zoom to this" arrow placement="bottom" sx={tooltipStyle}>
                                  <IconButton onClick={() => zoomToProperty(rec.uprn)} size="small">
                                    <MyLocationIcon sx={ActionIconStyle()} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="More actions" arrow placement="bottom" sx={tooltipStyle}>
                                  <IconButton
                                    onClick={handlePropertyActionsMenuClick}
                                    aria-controls="property-actions-menu"
                                    aria-haspopup="true"
                                    size="small"
                                  >
                                    <MoreVertIcon sx={ActionIconStyle()} />
                                  </IconButton>
                                </Tooltip>
                                {AddMenuItems(
                                  rec,
                                  "property-actions-menu",
                                  anchorPropertyActionsEl,
                                  handlePropertyActionsMenuClose
                                )}
                              </Stack>
                            )}
                        </Stack>
                      }
                      onMouseEnter={() => handleMouseEnterProperty(rec.uprn)}
                      onMouseLeave={handleMouseLeaveProperty}
                    >
                      {data.properties &&
                        data.properties
                          .filter((x) => x.parentUprn === rec.uprn)
                          .sort(function (a, b) {
                            return a.primary.address && b.primary.address
                              ? a.primary.address.localeCompare(b.primary.address, undefined, {
                                  numeric: true,
                                  sensitivity: "base",
                                })
                              : 0;
                          })
                          .map((child1) => {
                            // console.log("[SF] child1", child1);
                            return (
                              <TreeItem
                                key={child1.uprn}
                                nodeId={child1.uprn.toString()}
                                sx={treeItemStyle(child1.uprn)}
                                label={
                                  <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
                                      {data.properties &&
                                      data.properties.filter((x) => x.parentUprn === child1.uprn).length > 0 ? (
                                        <Avatar
                                          variant="rounded"
                                          sx={GetTabIconStyle(
                                            data.properties && data.properties
                                              ? data.properties.filter((x) => x.parentUprn === child1.uprn).length
                                              : 0
                                          )}
                                        >
                                          <Typography variant="caption">
                                            <strong>
                                              {data.properties && data.properties
                                                ? data.properties.filter((x) => x.parentUprn === child1.uprn).length
                                                : 0}
                                            </strong>
                                          </Typography>
                                        </Avatar>
                                      ) : (
                                        <Box sx={{ width: "24px" }} />
                                      )}
                                      {(propertySelected && propertySelected === child1.uprn) ||
                                      propertyChecked.includes(child1.uprn.toString()) ? (
                                        <Checkbox
                                          sx={{
                                            pl: theme.spacing(0),
                                            pr: theme.spacing(0),
                                          }}
                                          checked={propertyChecked.includes(child1.uprn.toString())}
                                          onChange={(event) => handleCheckboxChange(event, child1.uprn.toString())}
                                        />
                                      ) : (
                                        <Box sx={{ width: "24px" }} />
                                      )}
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        justifyContent="flex-start"
                                        alignItems="flex-start"
                                      >
                                        {GetClassificationIcon(
                                          child1.blpuClass ? child1.blpuClass : "R",
                                          GetAvatarColour(child1.primary.logicalStatus)
                                        )}
                                        <Stack direction="column">
                                          <Stack
                                            direction="row"
                                            spacing={1}
                                            justifyContent="flex-start"
                                            alignItems="center"
                                            sx={LanguageAddressPairStyle()}
                                          >
                                            <Chip
                                              size="small"
                                              label={child1.primary.language}
                                              sx={PropertyLanguageChipStyle(child1.primary.logicalStatus)}
                                            />
                                            <Typography
                                              variant="subtitle2"
                                              sx={AddressStyle(
                                                child1.uprn.toString() ===
                                                  propertyContext.currentProperty.uprn.toString()
                                              )}
                                            >
                                              {addressToTitleCase(child1.primary.address, child1.primary.postcode)}
                                            </Typography>
                                          </Stack>
                                          {child1.additional.map((child1Add) => {
                                            return (
                                              <Stack
                                                direction="row"
                                                spacing={1}
                                                justifyContent="flex-start"
                                                alignItems="center"
                                                key={child1Add.lpiKey}
                                                sx={LanguageAddressPairStyle()}
                                              >
                                                <Chip
                                                  size="small"
                                                  label={child1Add.language}
                                                  sx={PropertyLanguageChipStyle(child1Add.logicalStatus)}
                                                />
                                                <Typography
                                                  variant="subtitle2"
                                                  sx={AddressStyle(
                                                    child1.uprn.toString() ===
                                                      propertyContext.currentProperty.uprn.toString()
                                                  )}
                                                >
                                                  {addressToTitleCase(child1Add.address, child1Add.postcode)}
                                                </Typography>
                                              </Stack>
                                            );
                                          })}
                                        </Stack>
                                      </Stack>
                                    </Stack>
                                    {propertySelected &&
                                      propertySelected === child1.uprn &&
                                      propertyChecked &&
                                      propertyChecked.length < 2 && (
                                        <Stack direction="row" justifyContent="flex-end" alignItems="center">
                                          <Tooltip title="Copy UPRN" arrow placement="bottom" sx={tooltipStyle}>
                                            <IconButton
                                              onClick={(event) => itemCopy(event, child1.uprn.toString(), "UPRN")}
                                              size="small"
                                            >
                                              <CopyIcon sx={ActionIconStyle()} />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="Zoom to this" arrow placement="bottom" sx={tooltipStyle}>
                                            <IconButton onClick={() => zoomToProperty(child1.uprn)} size="small">
                                              <MyLocationIcon sx={ActionIconStyle()} />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="More actions" arrow placement="bottom" sx={tooltipStyle}>
                                            <IconButton
                                              onClick={handleChild1ActionsMenuClick}
                                              aria-controls="child1-actions-menu"
                                              aria-haspopup="true"
                                              size="small"
                                            >
                                              <MoreVertIcon sx={ActionIconStyle()} />
                                            </IconButton>
                                          </Tooltip>
                                          {AddMenuItems(
                                            child1,
                                            "child1-actions-menu",
                                            anchorPropertyActionsEl2,
                                            handleChild1ActionsMenuClose
                                          )}
                                        </Stack>
                                      )}
                                  </Stack>
                                }
                                onMouseEnter={() => handleMouseEnterProperty(child1.uprn)}
                                onMouseLeave={handleMouseLeaveProperty}
                              >
                                {data.properties &&
                                  data.properties
                                    .filter((x) => x.parentUprn === child1.uprn)
                                    .sort(function (a, b) {
                                      return a.primary.address && b.primary.address
                                        ? a.primary.address.localeCompare(b.primary.address, undefined, {
                                            numeric: true,
                                            sensitivity: "base",
                                          })
                                        : 0;
                                    })
                                    .map((child2) => {
                                      // console.log("[SF] child2", child2);
                                      return (
                                        <TreeItem
                                          key={child2.uprn}
                                          nodeId={child2.uprn.toString()}
                                          sx={treeItemStyle(child2.uprn)}
                                          label={
                                            <Stack
                                              direction="row"
                                              spacing={1}
                                              justifyContent="space-between"
                                              alignItems="center"
                                            >
                                              <Stack
                                                direction="row"
                                                spacing={1}
                                                justifyContent="flex-start"
                                                alignItems="center"
                                              >
                                                {data.properties &&
                                                data.properties.filter((x) => x.parentUprn === child2.uprn).length >
                                                  0 ? (
                                                  <Avatar
                                                    variant="rounded"
                                                    sx={GetTabIconStyle(
                                                      data.properties && data.properties
                                                        ? data.properties.filter((x) => x.parentUprn === child2.uprn)
                                                            .length
                                                        : 0
                                                    )}
                                                  >
                                                    <Typography variant="caption">
                                                      <strong>
                                                        {data.properties && data.properties
                                                          ? data.properties.filter((x) => x.parentUprn === child2.uprn)
                                                              .length
                                                          : 0}
                                                      </strong>
                                                    </Typography>
                                                  </Avatar>
                                                ) : (
                                                  <Box sx={{ width: "24px" }} />
                                                )}
                                                {(propertySelected && propertySelected === child2.uprn) ||
                                                propertyChecked.includes(child2.uprn.toString()) ? (
                                                  <Checkbox
                                                    sx={{
                                                      pl: theme.spacing(0),
                                                      pr: theme.spacing(0),
                                                    }}
                                                    checked={propertyChecked.includes(child2.uprn.toString())}
                                                    onChange={(event) =>
                                                      handleCheckboxChange(event, child2.uprn.toString())
                                                    }
                                                  />
                                                ) : (
                                                  <Box sx={{ width: "24px" }} />
                                                )}
                                                <Stack
                                                  direction="row"
                                                  spacing={1}
                                                  justifyContent="flex-start"
                                                  alignItems="flex-start"
                                                >
                                                  {GetClassificationIcon(
                                                    child2.blpuClass ? child2.blpuClass : "R",
                                                    GetAvatarColour(child2.primary.logicalStatus)
                                                  )}
                                                  <Stack direction="column">
                                                    <Stack
                                                      direction="row"
                                                      spacing={1}
                                                      justifyContent="flex-start"
                                                      alignItems="center"
                                                      sx={LanguageAddressPairStyle()}
                                                    >
                                                      <Chip
                                                        size="small"
                                                        label={child2.primary.language}
                                                        sx={PropertyLanguageChipStyle(child2.primary.logicalStatus)}
                                                      />
                                                      <Typography
                                                        variant="subtitle2"
                                                        sx={AddressStyle(
                                                          child2.uprn.toString() ===
                                                            propertyContext.currentProperty.uprn.toString()
                                                        )}
                                                      >
                                                        {addressToTitleCase(
                                                          child2.primary.address,
                                                          child2.primary.postcode
                                                        )}
                                                      </Typography>
                                                    </Stack>
                                                    {child2.additional.map((child2Add) => {
                                                      return (
                                                        <Stack
                                                          direction="row"
                                                          spacing={1}
                                                          justifyContent="flex-start"
                                                          alignItems="center"
                                                          key={child2Add.lpiKey}
                                                          sx={LanguageAddressPairStyle()}
                                                        >
                                                          <Chip
                                                            size="small"
                                                            label={child2Add.language}
                                                            sx={PropertyLanguageChipStyle(child2Add.logicalStatus)}
                                                          />
                                                          <Typography
                                                            variant="subtitle2"
                                                            sx={AddressStyle(
                                                              child2.uprn.toString() ===
                                                                propertyContext.currentProperty.uprn.toString()
                                                            )}
                                                          >
                                                            {addressToTitleCase(child2Add.address, child2Add.postcode)}
                                                          </Typography>
                                                        </Stack>
                                                      );
                                                    })}
                                                  </Stack>
                                                </Stack>
                                              </Stack>
                                              {propertySelected &&
                                                propertySelected === child2.uprn &&
                                                propertyChecked &&
                                                propertyChecked.length < 2 && (
                                                  <Stack direction="row" justifyContent="flex-end" alignItems="center">
                                                    <Tooltip
                                                      title="Copy UPRN"
                                                      arrow
                                                      placement="bottom"
                                                      sx={tooltipStyle}
                                                    >
                                                      <IconButton
                                                        onClick={(event) =>
                                                          itemCopy(event, child2.uprn.toString(), "UPRN")
                                                        }
                                                        size="small"
                                                      >
                                                        <CopyIcon sx={ActionIconStyle()} />
                                                      </IconButton>
                                                    </Tooltip>
                                                    <Tooltip
                                                      title="Zoom to this"
                                                      arrow
                                                      placement="bottom"
                                                      sx={tooltipStyle}
                                                    >
                                                      <IconButton
                                                        onClick={() => zoomToProperty(child2.uprn)}
                                                        size="small"
                                                      >
                                                        <MyLocationIcon sx={ActionIconStyle()} />
                                                      </IconButton>
                                                    </Tooltip>
                                                    <Tooltip
                                                      title="More actions"
                                                      arrow
                                                      placement="bottom"
                                                      sx={tooltipStyle}
                                                    >
                                                      <IconButton
                                                        onClick={handleChild2ActionsMenuClick}
                                                        aria-controls="child2-actions-menu"
                                                        aria-haspopup="true"
                                                        size="small"
                                                      >
                                                        <MoreVertIcon sx={ActionIconStyle()} />
                                                      </IconButton>
                                                    </Tooltip>
                                                    {AddMenuItems(
                                                      child2,
                                                      "child2-actions-menu",
                                                      anchorPropertyActionsEl3,
                                                      handleChild2ActionsMenuClose
                                                    )}
                                                  </Stack>
                                                )}
                                            </Stack>
                                          }
                                          onMouseEnter={() => handleMouseEnterProperty(child2.uprn)}
                                          onMouseLeave={handleMouseLeaveProperty}
                                        >
                                          {data.properties &&
                                            data.properties
                                              .filter((x) => x.parentUprn === child2.uprn)
                                              .sort(function (a, b) {
                                                return a.primary.address && b.primary.address
                                                  ? a.primary.address.localeCompare(b.primary.address, undefined, {
                                                      numeric: true,
                                                      sensitivity: "base",
                                                    })
                                                  : 0;
                                              })
                                              .map((child3) => {
                                                // console.log("[SF] child3", child3);
                                                return (
                                                  <TreeItem
                                                    key={child3.uprn}
                                                    nodeId={child3.uprn.toString()}
                                                    sx={treeItemStyle(child3.uprn)}
                                                    label={
                                                      <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        justifyContent="space-between"
                                                        alignItems="center"
                                                      >
                                                        <Stack
                                                          direction="row"
                                                          spacing={1}
                                                          justifyContent="flex-start"
                                                          alignItems="center"
                                                        >
                                                          {data.properties &&
                                                          data.properties.filter((x) => x.parentUprn === child3.uprn)
                                                            .length > 0 ? (
                                                            <Avatar
                                                              variant="rounded"
                                                              sx={GetTabIconStyle(
                                                                data.properties && data.properties
                                                                  ? data.properties.filter(
                                                                      (x) => x.parentUprn === child3.uprn
                                                                    ).length
                                                                  : 0
                                                              )}
                                                            >
                                                              <Typography variant="caption">
                                                                <strong>
                                                                  {data.properties && data.properties
                                                                    ? data.properties.filter(
                                                                        (x) => x.parentUprn === child3.uprn
                                                                      ).length
                                                                    : 0}
                                                                </strong>
                                                              </Typography>
                                                            </Avatar>
                                                          ) : (
                                                            <Box sx={{ width: "24px" }} />
                                                          )}
                                                          {(propertySelected && propertySelected === child3.uprn) ||
                                                          propertyChecked.includes(child3.uprn.toString()) ? (
                                                            <Checkbox
                                                              sx={{
                                                                pl: theme.spacing(0),
                                                                pr: theme.spacing(0),
                                                              }}
                                                              checked={propertyChecked.includes(child3.uprn.toString())}
                                                              onChange={(event) =>
                                                                handleCheckboxChange(event, child3.uprn.toString())
                                                              }
                                                            />
                                                          ) : (
                                                            <Box
                                                              sx={{
                                                                width: "24px",
                                                              }}
                                                            />
                                                          )}
                                                          <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            justifyContent="flex-start"
                                                            alignItems="flex-start"
                                                          >
                                                            {GetClassificationIcon(
                                                              child3.blpuClass ? child3.blpuClass : "R",
                                                              GetAvatarColour(child3.primary.logicalStatus)
                                                            )}
                                                            <Stack direction="column">
                                                              <Stack
                                                                direction="row"
                                                                spacing={1}
                                                                justifyContent="flex-start"
                                                                alignItems="center"
                                                                sx={LanguageAddressPairStyle()}
                                                              >
                                                                <Chip
                                                                  size="small"
                                                                  label={child3.primary.language}
                                                                  sx={PropertyLanguageChipStyle(
                                                                    child3.primary.logicalStatus
                                                                  )}
                                                                />
                                                                <Typography
                                                                  variant="subtitle2"
                                                                  sx={AddressStyle(
                                                                    child3.uprn.toString() ===
                                                                      propertyContext.currentProperty.uprn.toString()
                                                                  )}
                                                                >
                                                                  {addressToTitleCase(
                                                                    child3.primary.address,
                                                                    child3.primary.postcode
                                                                  )}
                                                                </Typography>
                                                              </Stack>
                                                              {child3.additional.map((child3Add) => {
                                                                return (
                                                                  <Stack
                                                                    direction="row"
                                                                    spacing={1}
                                                                    justifyContent="flex-start"
                                                                    alignItems="center"
                                                                    key={child3Add.lpiKey}
                                                                    sx={LanguageAddressPairStyle()}
                                                                  >
                                                                    <Chip
                                                                      size="small"
                                                                      label={child3Add.language}
                                                                      sx={PropertyLanguageChipStyle(
                                                                        child3Add.logicalStatus
                                                                      )}
                                                                    />
                                                                    <Typography
                                                                      variant="subtitle2"
                                                                      sx={AddressStyle(
                                                                        child3.uprn.toString() ===
                                                                          propertyContext.currentProperty.uprn.toString()
                                                                      )}
                                                                    >
                                                                      {addressToTitleCase(
                                                                        child3Add.address,
                                                                        child3Add.postcode
                                                                      )}
                                                                    </Typography>
                                                                  </Stack>
                                                                );
                                                              })}
                                                            </Stack>
                                                          </Stack>
                                                        </Stack>
                                                        {propertySelected &&
                                                          propertySelected === child3.uprn &&
                                                          propertyChecked &&
                                                          propertyChecked.length < 2 && (
                                                            <Stack
                                                              direction="row"
                                                              justifyContent="flex-end"
                                                              alignItems="center"
                                                            >
                                                              <Tooltip
                                                                title="Copy UPRN"
                                                                arrow
                                                                placement="bottom"
                                                                sx={tooltipStyle}
                                                              >
                                                                <IconButton
                                                                  onClick={(event) =>
                                                                    itemCopy(event, child3.uprn.toString(), "UPRN")
                                                                  }
                                                                  size="small"
                                                                >
                                                                  <CopyIcon sx={ActionIconStyle()} />
                                                                </IconButton>
                                                              </Tooltip>
                                                              <Tooltip
                                                                title="Zoom to this"
                                                                arrow
                                                                placement="bottom"
                                                                sx={tooltipStyle}
                                                              >
                                                                <IconButton
                                                                  onClick={() => zoomToProperty(child3.uprn)}
                                                                  size="small"
                                                                >
                                                                  <MyLocationIcon sx={ActionIconStyle()} />
                                                                </IconButton>
                                                              </Tooltip>
                                                              <Tooltip
                                                                title="More actions"
                                                                arrow
                                                                placement="bottom"
                                                                sx={tooltipStyle}
                                                              >
                                                                <IconButton
                                                                  onClick={handleChild3ActionsMenuClick}
                                                                  aria-controls="child3-actions-menu"
                                                                  aria-haspopup="true"
                                                                  size="small"
                                                                >
                                                                  <MoreVertIcon sx={ActionIconStyle()} />
                                                                </IconButton>
                                                              </Tooltip>
                                                              {AddMenuItems(
                                                                child3,
                                                                "child3-actions-menu",
                                                                anchorPropertyActionsEl4,
                                                                handleChild3ActionsMenuClose
                                                              )}
                                                            </Stack>
                                                          )}
                                                      </Stack>
                                                    }
                                                    onMouseEnter={() => handleMouseEnterProperty(child3.uprn)}
                                                    onMouseLeave={handleMouseLeaveProperty}
                                                  >
                                                    {}
                                                  </TreeItem>
                                                );
                                              })}
                                        </TreeItem>
                                      );
                                    })}
                              </TreeItem>
                            );
                          })}
                    </TreeItem>
                  );
                })}
          </TreeView>
        )}
        <Box sx={{ height: "24px" }} />
      </Box>
      <Popper id={selectionId} open={selectionOpen} anchorEl={selectionAnchorEl} placement="top-start">
        <ADSSelectionControl
          selectionCount={propertyChecked && propertyChecked.length > 0 ? propertyChecked.length : 0}
          haveProperty={propertyChecked.length > 0}
          currentProperty={
            propertyChecked && propertyChecked.length === 1 ? getPropertyFromId(propertyChecked[0]) : null
          }
          currentAddress={
            propertyChecked && propertyChecked.length === 1 && checkedAddress.current
              ? checkedAddress.current.address
              : null
          }
          propertyUprns={propertyChecked}
          onSetCopyOpen={handleSetCopyOpen}
          onPropertyMoved={handlePropertyMoved}
          onClose={handleCloseSelection}
        />
      </Popper>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        onClose={handleAlertClose}
      >
        <Alert
          sx={GetAlertStyle(alertType.current === "propertyMoved")}
          icon={GetAlertIcon(alertType.current === "propertyMoved")}
          onClose={handleAlertClose}
          severity={GetAlertSeverity(alertType.current === "propertyMoved")}
          elevation={6}
          variant="filled"
        >{`${
          alertType.current === "propertyMoved"
            ? `Changes saved successfully. Your moved seed points have been updated.`
            : `Unknown error.`
        }`}</Alert>
      </Snackbar>
      <MakeChildDialog
        isOpen={openMakeChild}
        variant="multi"
        selectedUPRNs={makeChildUprn}
        onClose={handleMakeChildClose}
      />
    </Fragment>
  );
}

export default RelatedPropertyTab;
