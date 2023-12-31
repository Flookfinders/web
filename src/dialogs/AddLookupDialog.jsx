//#region header */
/**************************************************************************************************
//
//  Description: Dialog used to add a new lookup
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   29.06.23 Sean Flook         WI40744 Removed Make Historic switch.
//    003   29.06.23 Sean Flook                 Added enabled flag for cross reference records.
//    004   06.10.23 Sean Flook                 Use colour variables.
//    005   24.11.23 Sean Flook                 Moved Stack to @mui/system.
//    006   05.01.24 Sean Flook                 Use CSS shortcuts.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useState, useContext, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Stack } from "@mui/system";

import { stringToSentenceCase } from "../utils/HelperUtils";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
// import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { adsBlueA, adsRed, adsLightGreyB } from "../utils/ADSColours";
import { blueButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

AddLookupDialog.propTypes = {
  variant: PropTypes.oneOf([
    "postcode",
    "postTown",
    "subLocality",
    "crossReference",
    "locality",
    "town",
    "island",
    "administrativeArea",
    "authority",
    "ward",
    "parish",
  ]).isRequired,
  isOpen: PropTypes.bool.isRequired,
  errorEng: PropTypes.object,
  errorAltLanguage: PropTypes.object,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function AddLookupDialog({ variant, isOpen, errorEng, errorAltLanguage, onDone, onClose }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);

  const [showDialog, setShowDialog] = useState(false);
  const [lookupType, setLookupType] = useState("unknown");
  const [engPlaceholder, setEngPlaceholder] = useState(null);
  const [cymPlaceholder, setCymPlaceholder] = useState(null);
  const [gaePlaceholder, setGaePlaceholder] = useState(null);
  const [engValue, setEngValue] = useState(null);
  const [cymValue, setCymValue] = useState(null);
  const [gaeValue, setGaeValue] = useState(null);
  const [crossRefDescription, setCrossRefDescription] = useState(null);
  const [crossRefSourceAuthority, setCrossRefSourceAuthority] = useState(null);
  const [crossRefSourceCode, setCrossRefSourceCode] = useState(null);
  const [crossRefEnabled, setCrossRefEnabled] = useState(true);
  const [crossRefExport, setCrossRefExport] = useState(false);
  const [wardName, setWardName] = useState(null);
  const [wardCode, setWardCode] = useState(null);
  const [parishName, setParishName] = useState(null);
  const [parishCode, setParishCode] = useState(null);
  const [engError, setEngError] = useState(null);
  const [cymError, setCymError] = useState(null);
  const [gaeError, setGaeError] = useState(null);
  const [crossRefDescriptionError, setCrossRefDescriptionError] = useState(null);
  const [crossRefSourceCodeError, setCrossRefSourceCodeError] = useState(null);
  const [wardNameError, setWardNameError] = useState(null);
  const [wardCodeError, setWardCodeError] = useState(null);
  const [parishNameError, setParishNameError] = useState(null);
  const [parishCodeError, setParishCodeError] = useState(null);

  /**
   * Method to determine if the data is valid or not.
   *
   * @returns {boolean} True if the data is valid; otherwise false.
   */
  const dataValid = () => {
    let validData = true;
    switch (variant) {
      case "postcode":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty postcode.");
          validData = false;
        } else {
          const postcodeRecord = lookupContext.currentLookups.postcodes.find((x) => x.postcode === engValue);
          if (postcodeRecord) {
            setEngError("There is already an entry with this postcode in the table.");
            validData = false;
          }
          const postcodeRegEx = /^([A-Z][A-HJ-Y]?[0-9][A-Z0-9]? ?[0-9][A-Z]{2}|GIR ?0A{2})$/;
          if (!postcodeRegEx.test(engValue)) {
            setEngError("This postcode does not have a valid format.");
            validData = false;
          }
        }
        break;

      case "postTown":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty post town.");
          validData = false;
        } else {
          const engPostTownRecord = lookupContext.currentLookups.postTowns.find(
            (x) => x.postTown === engValue && x.language === "ENG"
          );
          if (engPostTownRecord) {
            setEngError("There is already an English entry with this post town in the table.");
            validData = false;
          }
        }

        if (settingsContext.isWelsh) {
          if (!cymValue || cymValue.length === 0) {
            setCymError("You cannot add an empty post town.");
            validData = false;
          } else {
            const cymPostTownRecord = lookupContext.currentLookups.postTowns.find(
              (x) => x.postTown === cymValue && x.language === "CYM"
            );
            if (cymPostTownRecord) {
              setCymError("There is already a Welsh entry with this post town in the table.");
              validData = false;
            }
          }
        }

        if (settingsContext.isScottish) {
          if (!gaeValue || gaeValue.length === 0) {
            setGaeError("You cannot add an empty post town.");
            validData = false;
          } else {
            const gaePostTownRecord = lookupContext.currentLookups.postTowns.find(
              (x) => x.postTown === gaeValue && x.language === "GAE"
            );
            if (gaePostTownRecord) {
              setGaeError("There is already a Gaelic entry with this post town in the table.");
              validData = false;
            }
          }
        }
        break;

      case "subLocality":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty sub-locality.");
          validData = false;
        } else {
          const engSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
            (x) => x.subLocality === engValue && x.language === "ENG"
          );
          if (engSubLocalityRecord) {
            setEngError("There is already an English entry with this sub-locality in the table.");
            validData = false;
          }
        }

        if (!gaeValue || gaeValue.length === 0) {
          setGaeError("You cannot add an empty sub-locality.");
          validData = false;
        } else {
          const gaeSubLocalityRecord = lookupContext.currentLookups.subLocalities.find(
            (x) => x.subLocality === gaeValue && x.language === "GAE"
          );
          if (gaeSubLocalityRecord) {
            setGaeError("There is already a Gaelic entry with this sub-locality in the table.");
            validData = false;
          }
        }
        break;

      case "crossReference":
        if (!crossRefDescription || crossRefDescription.length === 0) {
          setCrossRefDescriptionError("You cannot have an empty description.");
          validData = false;
        } else {
          const crossRefDescriptionRecord = lookupContext.currentLookups.appCrossRefs.find(
            (x) => x.xrefDescription === crossRefDescription
          );
          if (crossRefDescriptionRecord) {
            setCrossRefDescriptionError("There is already a cross reference with this description.");
            validData = false;
          }
        }

        if (!crossRefSourceCode || crossRefSourceCode.length === 0) {
          setCrossRefSourceCodeError("You cannot have an empty source.");
          validData = false;
        } else {
          const crossRefSourceRecord = lookupContext.currentLookups.appCrossRefs.find(
            (x) => x.xrefSourceRef73 === `${crossRefSourceAuthority}${crossRefSourceCode}`
          );
          if (crossRefSourceRecord) {
            setCrossRefSourceCodeError("There is already a cross reference with this source.");
            validData = false;
          }
        }
        break;

      case "locality":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty locality.");
          validData = false;
        } else {
          const engLocalityRecord = lookupContext.currentLookups.localities.find(
            (x) => x.locality === engValue && x.language === "ENG"
          );
          if (engLocalityRecord) {
            setEngError("There is already an English entry with this locality in the table.");
            validData = false;
          }
        }

        if (settingsContext.isWelsh) {
          if (!cymValue || cymValue.length === 0) {
            setCymError("You cannot add an empty locality.");
            validData = false;
          } else {
            const cymLocalityRecord = lookupContext.currentLookups.localities.find(
              (x) => x.locality === cymValue && x.language === "CYM"
            );
            if (cymLocalityRecord) {
              setCymError("There is already a Welsh entry with this locality in the table.");
              validData = false;
            }
          }
        }

        if (settingsContext.isScottish) {
          if (!gaeValue || gaeValue.length === 0) {
            setGaeError("You cannot add an empty locality.");
            validData = false;
          } else {
            const gaeLocalityRecord = lookupContext.currentLookups.localities.find(
              (x) => x.locality === gaeValue && x.language === "GAE"
            );
            if (gaeLocalityRecord) {
              setGaeError("There is already a Gaelic entry with this locality in the table.");
              validData = false;
            }
          }
        }
        break;

      case "town":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty town.");
          validData = false;
        } else {
          const engTownRecord = lookupContext.currentLookups.towns.find(
            (x) => x.town === engValue && x.language === "ENG"
          );
          if (engTownRecord) {
            setEngError("There is already an English entry with this town in the table.");
            validData = false;
          }
        }

        if (settingsContext.isWelsh) {
          if (!cymValue || cymValue.length === 0) {
            setCymError("You cannot add an empty town.");
            validData = false;
          } else {
            const cymTownRecord = lookupContext.currentLookups.towns.find(
              (x) => x.town === cymValue && x.language === "CYM"
            );
            if (cymTownRecord) {
              setCymError("There is already a Welsh entry with this town in the table.");
              validData = false;
            }
          }
        }

        if (settingsContext.isScottish) {
          if (!gaeValue || gaeValue.length === 0) {
            setGaeError("You cannot add an empty town.");
            validData = false;
          } else {
            const gaeTownRecord = lookupContext.currentLookups.towns.find(
              (x) => x.town === gaeValue && x.language === "GAE"
            );
            if (gaeTownRecord) {
              setGaeError("There is already a Gaelic entry with this town in the table.");
              validData = false;
            }
          }
        }
        break;

      case "island":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty island.");
          validData = false;
        } else {
          const engIslandRecord = lookupContext.currentLookups.islands.find(
            (x) => x.island === engValue && x.language === "ENG"
          );
          if (engIslandRecord) {
            setEngError("There is already an English entry with this island in the table.");
            validData = false;
          }
        }

        if (!gaeValue || gaeValue.length === 0) {
          setGaeError("You cannot add an empty island.");
          validData = false;
        } else {
          const gaeIslandRecord = lookupContext.currentLookups.islands.find(
            (x) => x.island === gaeValue && x.language === "GAE"
          );
          if (gaeIslandRecord) {
            setGaeError("There is already a Gaelic entry with this island in the table.");
            validData = false;
          }
        }
        break;

      case "administrativeArea":
        if (!engValue || engValue.length === 0) {
          setEngError("You cannot add an empty administrative area.");
          validData = false;
        } else {
          const engAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
            (x) => x.administrativeArea === engValue && x.language === "ENG"
          );
          if (engAdministrativeAreaRecord) {
            setEngError("There is already an English entry with this administrative area in the table.");
            validData = false;
          }
        }

        if (settingsContext.isWelsh) {
          if (!cymValue || cymValue.length === 0) {
            setCymError("You cannot add an empty administrative area.");
            validData = false;
          } else {
            const cymAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
              (x) => x.town === cymValue && x.language === "CYM"
            );
            if (cymAdministrativeAreaRecord) {
              setCymError("There is already a Welsh entry with this administrative area in the table.");
              validData = false;
            }
          }
        }

        if (settingsContext.isScottish) {
          if (!gaeValue || gaeValue.length === 0) {
            setGaeError("You cannot add an empty administrative area.");
            validData = false;
          } else {
            const gaeAdministrativeAreaRecord = lookupContext.currentLookups.adminAuthorities.find(
              (x) => x.town === gaeValue && x.language === "GAE"
            );
            if (gaeAdministrativeAreaRecord) {
              setGaeError("There is already a Gaelic entry with this administrative area in the table.");
              validData = false;
            }
          }
        }
        break;

      case "ward":
        if (!wardName || wardName.length === 0) {
          setWardNameError("You cannot add an empty ward.");
          validData = false;
        } else {
          const wardNameRecord = lookupContext.currentLookups.wards.find((x) => x.ward === wardName);
          if (wardNameRecord) {
            setWardNameError("There is already an entry with this ward in the table.");
          }
        }

        if (!wardCode || wardCode.length === 0) {
          setWardCodeError("You cannot add an empty code.");
          validData = false;
        } else {
          const wardCodeRecord = lookupContext.currentLookups.wards.find((x) => x.wardCode === wardCode);
          if (wardCodeRecord) {
            setWardCodeError("There is already an entry with this code in the table.");
          }
        }
        break;

      case "parish":
        if (!parishName || parishName.length === 0) {
          setParishNameError("You cannot add an empty parish.");
          validData = false;
        } else {
          const parishNameRecord = lookupContext.currentLookups.parishes.find((x) => x.parish === parishName);
          if (parishNameRecord) {
            setParishNameError("There is already an entry with this parish in the table.");
          }
        }

        if (!parishCode || parishCode.length === 0) {
          setParishCodeError("You cannot add an empty code.");
          validData = false;
        } else {
          const parishCodeRecord = lookupContext.currentLookups.parishes.find((x) => x.parishCode === parishCode);
          if (parishCodeRecord) {
            setParishCodeError("There is already an entry with this code in the table.");
          }
        }
        break;

      default:
        break;
    }

    return validData;
  };

  /**
   * Method to return the new lookup data.
   *
   * @returns {object} The new lookup data.
   */
  const getLookupData = () => {
    switch (variant) {
      case "postcode":
        return { variant: variant, lookupData: { postcode: engValue, historic: false } };

      case "postTown":
      case "locality":
      case "town":
      case "administrativeArea":
        return {
          variant: variant,
          lookupData: { english: engValue, welsh: cymValue, gaelic: gaeValue, historic: false },
        };

      case "subLocality":
      case "island":
        return { variant: variant, lookupData: { english: engValue, gaelic: gaeValue, historic: false } };

      case "crossReference":
        return {
          variant: variant,
          lookupData: {
            xrefDescription: crossRefDescription,
            xrefSourceRef73: `${crossRefSourceAuthority}${crossRefSourceCode}`,
            historic: false,
            enabled: crossRefEnabled,
            export: crossRefExport,
          },
        };

      case "ward":
        return { variant: variant, lookupData: { ward: wardName, wardCode: wardCode, historic: false } };

      case "parish":
        return {
          variant: variant,
          lookupData: { parish: parishName, parishCode: parishCode, historic: false },
        };

      default:
        return null;
    }
  };

  /**
   * Event to handle when the dialog closes.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the dialog is closing.
   */
  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    if (reason === "escapeKeyDown") handleCancelClick();
  };

  /**
   * Event to handle when the done button is clicked.
   */
  const handleDoneClick = () => {
    if (dataValid()) {
      if (onDone) onDone(getLookupData());
    }
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
  };

  /**
   * Event to handle when the English value changes.
   *
   * @param {object} event The event object.
   */
  const onEngChange = (event) => {
    if (variant === "postcode") setEngValue(event.target.value.toUpperCase());
    else setEngValue(event.target.value);
  };

  /**
   * Event to handle when the Welsh value changes.
   *
   * @param {object} event The event object.
   */
  const onCymChange = (event) => {
    setCymValue(event.target.value);
  };

  /**
   * Event to handle when the Scottish value changes.
   *
   * @param {object} event The event object.
   */
  const onGaeChange = (event) => {
    setGaeValue(event.target.value);
  };

  /**
   * Event to handle when the cross reference description changes.
   *
   * @param {object} event The event object.
   */
  const onCrossRefDescriptionChange = (event) => {
    setCrossRefDescription(event.target.value);
  };

  /**
   * Event to handle when the cross reference source code changes.
   *
   * @param {object} event The event object.
   */
  const onCrossRefSourceCodeChange = (event) => {
    setCrossRefSourceCode(event.target.value);
  };

  /**
   * Event to handle when the cross reference enabled changes.
   */
  const onCrossRefEnabledChange = () => {
    setCrossRefEnabled(!crossRefEnabled);
  };

  /**
   * Event to handle when the cross reference export changes.
   */
  const onCrossRefExportChange = () => {
    setCrossRefExport(!crossRefExport);
  };

  /**
   * Event to handle when the ward name changes.
   *
   * @param {object} event The event object.
   */
  const onWardNameChange = (event) => {
    setWardName(event.target.value);
  };

  /**
   * Event to handle when the ward code changes.
   *
   * @param {object} event The event object.
   */
  const onWardCodeChange = (event) => {
    setWardCode(event.target.value);
  };

  /**
   * Event to handle when the parish name changes.
   *
   * @param {object} event The event object.
   */
  const onParishNameChange = (event) => {
    setParishName(event.target.value);
  };

  /**
   * Event to handle when the parish code changes.
   *
   * @param {object} event The event object.
   */
  const onParishCodeChange = (event) => {
    setParishCode(event.target.value);
  };

  /**
   * Method to get the maximum field length for each variant.
   *
   * @returns {string} The maximum field length.
   */
  const getMaxFieldLength = () => {
    switch (variant) {
      case "postcode":
        return "8";

      case "postTown":
        return "30";

      case "subLocality":
        return "35";

      case "locality":
        return "35";

      case "town":
        return "30";

      case "island":
        return "30";

      case "administrativeArea":
        return "30";

      default:
        break;
    }
  };

  useEffect(() => {
    switch (variant) {
      case "postcode":
        setLookupType("postcode");
        setEngPlaceholder("e.g. GU21 5SB");
        setEngValue(null);
        setEngError(null);
        break;

      case "postTown":
        setLookupType("post town");
        if (settingsContext.isWelsh) {
          setEngPlaceholder("e.g. Cardiff");
          setCymPlaceholder("e.g. Caerdydd");
          setEngValue(null);
          setCymValue(null);
          setEngError(null);
          setCymError(null);
        } else if (settingsContext.isScottish) {
          setEngPlaceholder("e.g. Perth");
          setGaePlaceholder("e.g. Peairt");
          setEngValue(null);
          setGaeValue(null);
          setEngError(null);
          setGaeError(null);
        } else {
          setEngPlaceholder("e.g. Woking");
          setEngValue(null);
          setEngError(null);
        }
        break;

      case "subLocality":
        setLookupType("sub-locality");
        setEngPlaceholder("e.g. Perth");
        setGaePlaceholder("e.g. Peairt");
        setEngValue(null);
        setGaeValue(null);
        setEngError(null);
        setGaeError(null);
        break;

      case "crossReference":
        setLookupType("cross reference");
        setCrossRefSourceAuthority(settingsContext ? settingsContext.authorityCode : null);
        setCrossRefDescription(null);
        setCrossRefSourceCode(null);
        setCrossRefExport(false);
        setCrossRefEnabled(true);
        setCrossRefDescriptionError(null);
        setCrossRefSourceCodeError(null);
        break;

      case "locality":
        setLookupType("locality");
        if (settingsContext.isWelsh) {
          setEngPlaceholder("e.g. Cardiff");
          setCymPlaceholder("e.g. Caerdydd");
          setEngValue(null);
          setCymValue(null);
          setEngError(null);
          setCymError(null);
        } else if (settingsContext.isScottish) {
          setEngPlaceholder("e.g. Perth");
          setGaePlaceholder("e.g. Peairt");
          setEngValue(null);
          setGaeValue(null);
          setEngError(null);
          setGaeError(null);
        } else {
          setEngPlaceholder("e.g. Woking");
          setEngValue(null);
          setEngError(null);
        }
        break;

      case "town":
        setLookupType("town");
        if (settingsContext.isWelsh) {
          setEngPlaceholder("e.g. Cardiff");
          setCymPlaceholder("e.g. Caerdydd");
          setEngValue(null);
          setCymValue(null);
          setEngError(null);
          setCymError(null);
        } else if (settingsContext.isScottish) {
          setEngPlaceholder("e.g. Perth");
          setGaePlaceholder("e.g. Peairt");
          setEngValue(null);
          setGaeValue(null);
          setEngError(null);
          setGaeError(null);
        } else {
          setEngPlaceholder("e.g. Woking");
          setEngValue(null);
          setEngError(null);
        }
        break;

      case "island":
        setLookupType("island");
        setEngPlaceholder("e.g. Raasay");
        setGaePlaceholder("e.g. Ratharsair");
        setEngValue(null);
        setGaeValue(null);
        setEngError(null);
        setGaeError(null);
        break;

      case "administrativeArea":
        setLookupType("administrative area");
        if (settingsContext.isWelsh) {
          setEngPlaceholder("e.g. Cardiff");
          setCymPlaceholder("e.g. Caerdydd");
          setEngValue(null);
          setCymValue(null);
          setEngError(null);
          setCymError(null);
        } else if (settingsContext.isScottish) {
          setEngPlaceholder("e.g. Perthshire");
          setGaePlaceholder("e.g. Siorrachd Pheairt");
          setEngValue(null);
          setGaeValue(null);
          setEngError(null);
          setGaeError(null);
        } else {
          setEngPlaceholder("e.g. Woking");
          setEngValue(null);
          setEngError(null);
        }
        break;

      case "ward":
        setLookupType("ward");
        setWardName(null);
        setWardCode(null);
        setWardNameError(null);
        setWardCodeError(null);
        break;

      case "parish":
        setLookupType("parish");
        setParishName(null);
        setParishCode(null);
        setParishNameError(null);
        setParishCodeError(null);
        break;

      default:
        setLookupType("unknown");
        break;
    }

    setShowDialog(isOpen);
  }, [variant, isOpen, settingsContext]);

  useEffect(() => {
    if (errorEng) setEngError(errorEng);
    else setEngError(null);

    if (errorAltLanguage) {
      setCymError(errorAltLanguage);
      setGaeError(errorAltLanguage);
    } else {
      setCymError(null);
      setGaeError(null);
    }
  }, [errorEng, errorAltLanguage]);

  return (
    <Dialog open={showDialog} aria-labelledby="add-lookup-dialog" fullWidth maxWidth="xs" onClose={handleDialogClose}>
      <DialogTitle
        id="add-lookup-dialog"
        sx={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: adsBlueA }}
      >
        <Typography variant="h6">{`Add ${lookupType}`}</Typography>
        <IconButton
          aria-label="close"
          onClick={handleCancelClick}
          sx={{ position: "absolute", right: 12, top: 12, color: adsLightGreyB }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        {variant === "crossReference" ? (
          <Grid container alignItems="center" rowSpacing={2}>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Description
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                error={crossRefDescriptionError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {crossRefDescriptionError}
                  </Typography>
                }
                value={crossRefDescription}
                placeholder="e.g. Council Tax"
                fullWidth
                autoFocus
                size="small"
                inputProps={{ maxLength: "200" }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onCrossRefDescriptionChange}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Source
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Stack direction="row" alignItems="center">
                <Typography variant="body1" sx={{ ml: theme.spacing(1) }} gutterBottom>
                  {crossRefSourceAuthority}
                </Typography>
                <TextField
                  variant="outlined"
                  error={crossRefSourceCodeError}
                  helperText={
                    <Typography variant="caption" color={adsRed} align="left">
                      {crossRefSourceCodeError}
                    </Typography>
                  }
                  value={crossRefSourceCode}
                  placeholder="AA"
                  size="small"
                  inputProps={{ maxLength: "2" }}
                  sx={{
                    color: theme.palette.background.contrastText,
                    pl: theme.spacing(1),
                    pr: theme.spacing(1),
                    mb: theme.spacing(1),
                    width: "70px",
                  }}
                  onChange={onCrossRefSourceCodeChange}
                />
              </Stack>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Enabled
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <FormControlLabel
                value="end"
                control={
                  <Switch
                    id={"ads-switch-enabled"}
                    checked={crossRefEnabled}
                    onChange={onCrossRefEnabledChange}
                    color="primary"
                    aria-labelledby={"ads-switch-label-enabled"}
                  />
                }
                label={crossRefEnabled ? "Yes" : "No"}
                labelPlacement="end"
                sx={{ ml: "1px", mb: theme.spacing(1) }}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Include in export
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <FormControlLabel
                value="end"
                control={
                  <Switch
                    id={"ads-switch-include-in-export"}
                    checked={crossRefExport}
                    onChange={onCrossRefExportChange}
                    color="primary"
                    aria-labelledby={"ads-switch-label-include-in-export"}
                  />
                }
                label={crossRefExport ? "Yes" : "No"}
                labelPlacement="end"
                sx={{ ml: "1px", mb: theme.spacing(1) }}
              />
            </Grid>
          </Grid>
        ) : variant === "ward" ? (
          <Grid container alignItems="center" sx={{ mt: theme.spacing(1) }} rowSpacing={2}>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Ward
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                error={wardNameError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {wardNameError}
                  </Typography>
                }
                value={wardName}
                placeholder="e.g. Byfleet"
                fullWidth
                autoFocus
                size="small"
                inputProps={{ maxLength: "200" }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onWardNameChange}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Code
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                error={wardCodeError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {wardCodeError}
                  </Typography>
                }
                value={wardCode}
                placeholder="e.g. E05007441"
                fullWidth
                size="small"
                inputProps={{ maxLength: "10" }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onWardCodeChange}
              />
            </Grid>
          </Grid>
        ) : variant === "parish" ? (
          <Grid container alignItems="center" sx={{ mt: theme.spacing(1) }} rowSpacing={2}>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Parish
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                error={parishNameError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {parishNameError}
                  </Typography>
                }
                value={parishName}
                placeholder="e.g. Byfleet"
                fullWidth
                autoFocus
                size="small"
                inputProps={{ maxLength: "200" }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onParishNameChange}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                Code
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                error={parishCodeError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {parishCodeError}
                  </Typography>
                }
                value={parishCode}
                placeholder="e.g. E04009626"
                fullWidth
                size="small"
                inputProps={{ maxLength: "10" }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onParishCodeChange}
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container alignItems="center" sx={{ mt: theme.spacing(1) }} rowSpacing={2}>
            <Grid item xs={4}>
              <Typography variant="body1" align="right" gutterBottom>
                {`${
                  variant === "postcode"
                    ? "Postcode"
                    : !settingsContext.isWelsh && !settingsContext.isScottish
                    ? stringToSentenceCase(lookupType)
                    : "English"
                }`}
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                error={engError}
                helperText={
                  <Typography variant="caption" color={adsRed} align="left">
                    {engError}
                  </Typography>
                }
                value={engValue}
                placeholder={engPlaceholder}
                fullWidth
                autoFocus
                size="small"
                inputProps={{ maxLength: `${getMaxFieldLength()}` }}
                sx={{
                  color: theme.palette.background.contrastText,
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
                onChange={onEngChange}
              />
            </Grid>
            {variant !== "postcode" && settingsContext.isWelsh && (
              <Fragment>
                <Grid item xs={4}>
                  <Typography variant="body2" align="right" gutterBottom>
                    Welsh
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    variant="outlined"
                    error={cymError}
                    helperText={
                      <Typography variant="caption" color={adsRed} align="left">
                        {cymError}
                      </Typography>
                    }
                    value={cymValue}
                    placeholder={cymPlaceholder}
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: `${getMaxFieldLength()}` }}
                    sx={{
                      color: theme.palette.background.contrastText,
                      pl: theme.spacing(1),
                      pr: theme.spacing(1),
                    }}
                    onChange={onCymChange}
                  />
                </Grid>
              </Fragment>
            )}
            {variant !== "postcode" && settingsContext.isScottish && (
              <Fragment>
                <Grid item xs={4}>
                  <Typography variant="body1" align="right" gutterBottom>
                    Gaelic
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    variant="outlined"
                    error={gaeError}
                    helperText={
                      <Typography variant="caption" color={adsRed} align="left">
                        {gaeError}
                      </Typography>
                    }
                    value={gaeValue}
                    placeholder={gaePlaceholder}
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: `${getMaxFieldLength()}` }}
                    sx={{
                      color: theme.palette.background.contrastText,
                      pl: theme.spacing(1),
                      pr: theme.spacing(1),
                    }}
                    onChange={onGaeChange}
                  />
                </Grid>
              </Fragment>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(3) }}>
        <Button onClick={handleDoneClick} autoFocus variant="contained" sx={blueButtonStyle} startIcon={<DoneIcon />}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddLookupDialog;
