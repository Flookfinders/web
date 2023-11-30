//#region header */
/**************************************************************************************************
//
//  Description: Dialog used to multi-edit add classification for OneScotland authorities
//
//  Copyright:    © 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   26.10.23 Sean Flook       IMANN-175 Initial Revision.
//    002   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and renamed successor to successorCrossRef.
//    003   30.11.23 Sean Flook                 Use a constant for the default classification scheme.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";
import PropertyContext from "../context/propertyContext";
import SettingsContext from "../context/settingsContext";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Button,
  Grid,
  Backdrop,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { DataGrid } from "@mui/x-data-grid";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSDateControl from "../components/ADSDateControl";

import { GetCurrentDate } from "../utils/HelperUtils";
import { GetPropertyMapData, SaveProperty, addressToTitleCase } from "../utils/PropertyUtils";
import { ValidateClassificationData } from "../utils/PropertyValidation";

import OSGClassification, { OSGScheme } from "../data/OSGClassification";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

import {
  adsBlueA,
  adsGreenC,
  adsRed,
  adsLightGreyC,
  adsMidGreyA,
  adsPaleBlueB,
  adsDarkGrey10,
  adsDarkGrey20,
} from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { createTheme } from "@mui/material/styles";
import { useTheme, makeStyles } from "@mui/styles";

const defaultTheme = createTheme();
const useStyles = makeStyles(
  (theme) => {
    return {
      root: {
        "& .visible-row": {
          "&:hover": {
            backgroundColor: adsPaleBlueB,
            color: adsBlueA,
            // cursor: "pointer",
          },
        },
        "& .hidden-row": {
          backgroundColor: adsDarkGrey10,
          "&:hover": {
            backgroundColor: adsDarkGrey20,
            color: adsBlueA,
            // cursor: "pointer",
          },
        },
      },
    };
  },
  { defaultTheme }
);

MultiEditAddClassificationDialog.propTypes = {
  propertyUprns: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function MultiEditAddClassificationDialog({ propertyUprns, isOpen, onClose }) {
  const theme = useTheme();
  const classes = useStyles();

  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);
  const propertyContext = useContext(PropertyContext);
  const settingsContext = useContext(SettingsContext);

  const [showDialog, setShowDialog] = useState(false);
  const [classification, setClassification] = useState(null);
  const [startDate, setStartDate] = useState(GetCurrentDate());
  const [endDate, setEndDate] = useState(null);
  const [action, setAction] = useState("add");
  const [note, setNote] = useState(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const [classificationError, setClassificationError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);

  const [title, setTitle] = useState("Add cross reference");

  const [updating, setUpdating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [finaliseErrors, setFinaliseErrors] = useState([]);
  const [haveErrors, setHaveErrors] = useState(false);
  const [rangeProcessedCount, setRangeProcessedCount] = useState(0);

  const properties = useRef(null);
  const savedProperty = useRef(null);
  const updateErrors = useRef([]);
  const totalUpdateCount = useRef(0);
  const updatedCount = useRef(0);
  const failedCount = useRef(0);
  const failedIds = useRef([]);

  const [sortModel, setSortModel] = useState([{ field: "address", sort: "asc" }]);
  const [selectionModel, setSelectionModel] = useState([]);

  /**
   * Array of fields (columns) to be displayed in the data grid.
   */
  const columns = [
    { field: "id", hide: true },
    { field: "uprn", hide: true },
    {
      field: "address",
      headerName: "Address",
      headerClassName: "idox-multi-add-classification-error-data-grid-header",
      flex: 30,
    },
    {
      field: "errors",
      headerName: "Errors",
      cellClassName: "idox-multi-add-classification-error-data-grid-error",
      headerClassName: "idox-multi-add-classification-error-data-grid-header",
      flex: 30,
    },
  ];

  /**
   * Event to handle when the dialog is closing.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason why the dialog is closing.
   */
  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    if (reason === "escapeKeyDown") handleCancelClick();
  };

  /**
   * Event to handle when the confirm button is clicked.
   */
  const handleConfirmClick = () => {
    if (!haveErrors) updateProperties();
  };

  /**
   * Event to handle when the close button is clicked.
   */
  const handleCloseClick = () => {
    if (onClose) onClose(savedProperty.current);
    else setShowDialog(false);
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose(null);
    else setShowDialog(false);
  };

  /**
   * Event to handle when the add to list button is clicked.
   */
  const handleAddToListClick = () => {
    if (finaliseErrors && finaliseErrors.length > 0) {
    }
  };

  /**
   * Event to handle when the add note button is clicked.
   */
  const handleAddNoteClick = () => {
    setNoteOpen(true);
  };

  /**
   * Event to handle when the classification is changed.
   *
   * @param {string|null} newValue The new classification.
   */
  const handleClassificationChangeEvent = (newValue) => {
    setClassification(newValue);
    setClassificationError(null);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    setStartDateError(null);
  };

  /**
   * Event to handle when the end date is changed.
   *
   * @param {Date|null} newValue The new end date.
   */
  const handleEndDateChangeEvent = (newValue) => {
    setEndDate(newValue);
    setEndDateError(null);
  };

  /**
   * Event to handle when the action is changed.
   *
   * @param {object|null} event The new action.
   */
  const handleActionChangeEvent = (event) => {
    setAction(event.target.value);
  };

  /**
   * Event to handle when the note changes.
   *
   * @param {object} event The event object.
   */
  const handleNoteChangeEvent = (newValue) => {
    setNote(newValue);
  };

  /**
   * Method to determine if the data is valid or not.
   *
   * @returns {boolean} True if the data is valid; otherwise false.
   */
  const dataValid = () => {
    const validationData = {
      classification: classification,
      classScheme: OSGScheme,
      startDate: startDate,
      endDate: endDate,
    };

    const validationErrors = ValidateClassificationData(validationData, 0, lookupContext.currentLookups);

    setClassificationError(null);
    setStartDateError(null);
    setEndDateError(null);

    if (validationErrors && validationErrors.length > 0) {
      for (const error of validationErrors) {
        switch (error.field.toLowerCase()) {
          case "classification":
            setClassificationError(error.errors);
            break;

          case "startdate":
            setStartDateError(error.errors);
            break;

          case "enddate":
            setEndDateError(error.errors);
            break;

          default:
            break;
        }
      }

      return false;
    } else return true;
  };

  /**
   * Method to update the selected properties.
   */
  const updateProperties = async () => {
    savedProperty.current = null;
    setUpdating(true);

    if (dataValid()) {
      if (propertyUprns && propertyUprns.length > 0) {
        properties.current = [];
        savedProperty.current = [];
        totalUpdateCount.current = propertyUprns.length;
        updatedCount.current = 0;
        failedCount.current = 0;
        failedIds.current = [];
        setHaveErrors(false);
        updateErrors.current = [];
        setFinaliseErrors([]);

        const currentDate = GetCurrentDate();

        for (const propertyUprn of propertyUprns) {
          const property = await GetPropertyMapData(propertyUprn, userContext.currentUser.token);

          if (property) {
            let updatedProperty = null;

            const engLpi = property.lpis.filter((x) => x.language === "ENG");
            if (engLpi && engLpi.length > 0) {
              properties.current.push({
                id: property.pkId,
                uprn: property.uprn,
                address: addressToTitleCase(engLpi[0].address, engLpi[0].postcode),
              });
            }

            const minPkIdClass =
              property.classifications && property.classifications.length > 0
                ? property.classifications.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
                : null;
            const newPkIdClass =
              !minPkIdClass || !minPkIdClass.pkId || minPkIdClass.pkId > -10 ? -10 : minPkIdClass.pkId - 1;
            const newClassificationRec = {
              pkId: newPkIdClass,
              classKey: null,
              changeType: "I",
              uprn: property && property.uprn,
              classScheme: OSGScheme,
              blpuClass: classification,
              startDate: startDate,
              endDate: endDate,
              neverExport: property.neverExport,
            };

            let updatedClassifications = property.classifications ? property.classifications.map((x) => x) : [];
            let haveReplaceError = false;

            switch (action) {
              case "keep":
                updatedClassifications.push(newClassificationRec);
                break;

              case "delete":
                if (!property.classifications || property.classifications.length === 0)
                  updatedClassifications.push(newClassificationRec);
                else if (property.classifications && property.classifications.length === 1) {
                  updatedClassifications = property.classifications.map((x) => {
                    return { ...x, changeType: "D", endDate: currentDate };
                  });
                  updatedClassifications.push(newClassificationRec);
                } else if (property.blpuAppCrossRefs && property.classifications.length > 1) {
                  haveReplaceError = true;
                  setClassificationError(["Delete can only be used when there is only 1 previous classification."]);
                }
                break;

              case "historicise":
                if (!property.classifications || property.classifications.length === 0)
                  updatedClassifications.push(newClassificationRec);
                else if (property.classifications && property.classifications.length === 1) {
                  updatedClassifications = property.classifications.map((x) => {
                    return { ...x, changeType: "U", endDate: currentDate };
                  });
                  updatedClassifications.push(newClassificationRec);
                } else if (property.blpuAppCrossRefs && property.classifications.length > 1) {
                  haveReplaceError = true;
                  setClassificationError([
                    "Historicise can only be used when there is only 1 previous classification.",
                  ]);
                }
                break;

              case "update":
                if (!property.classifications || property.classifications.length === 0)
                  updatedClassifications.push(newClassificationRec);
                else if (property.classifications && property.classifications.length === 1) {
                  updatedClassifications = [
                    {
                      pkId: property.classifications[0].pkId,
                      classKey: property.classifications[0].classKey,
                      changeType: "U",
                      uprn: property && property.uprn,
                      classScheme: property.classifications[0].classScheme,
                      blpuClass: classification,
                      startDate: startDate,
                      endDate: endDate,
                      neverExport: property.neverExport,
                    },
                  ];
                } else if (property.blpuAppCrossRefs && property.classifications.length > 1) {
                  haveReplaceError = true;
                  setClassificationError(["Update can only be used when there is only 1 previous classification."]);
                }
                break;

              default:
                break;
            }

            const minPkIdNote =
              property.blpuNotes && property.blpuNotes.length > 0
                ? property.blpuNotes.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
                : null;
            const newPkIdNote =
              !minPkIdNote || !minPkIdNote.pkId || minPkIdNote.pkId > -10 ? -10 : minPkIdNote.pkId - 1;
            const maxSeqNoNote =
              property.blpuNotes && property.blpuNotes.length > 0
                ? property.blpuNotes.reduce((prev, curr) => (prev.seqNo > curr.seqNo ? prev : curr))
                : null;
            const newSeqNoNote = maxSeqNoNote && maxSeqNoNote.seqNo ? maxSeqNoNote.seqNo + 1 : 1;

            const updatedNotes = property.blpuNotes ? [...property.blpuNotes] : [];
            if (noteOpen)
              updatedNotes.push({
                uprn: property.uprn,
                note: note,
                changeType: "I",
                pkId: newPkIdNote,
                seqNo: newSeqNoNote,
              });

            updatedProperty = {
              changeType: property.changeType,
              blpuStateDate: property.blpuStateDate,
              rpc: property.rpc,
              startDate: property.startDate,
              endDate: property.endDate,
              parentUprn: property.parentUprn,
              neverExport: property.neverExport,
              siteSurvey: property.siteSurvey,
              uprn: property.uprn,
              logicalStatus: property.logicalStatus,
              blpuState: property.blpuState,
              blpuClass: property.blpuClass,
              localCustodianCode: property.localCustodianCode,
              organisation: property.organisation,
              xcoordinate: property.xcoordinate,
              ycoordinate: property.ycoordinate,
              wardCode: property.wardCode,
              parishCode: property.parishCode,
              pkId: property.pkId,
              blpuAppCrossRefs: property.blpuAppCrossRefs,
              blpuProvenances: property.blpuProvenances,
              classifications: updatedClassifications,
              organisations: property.organisations,
              successorCrossRefs: property.successorCrossRefs,
              blpuNotes: property.blpuNotes,
              lpis: property.lpis,
            };

            if (updatedProperty && !haveReplaceError) {
              SaveProperty(
                updatedProperty,
                false,
                userContext.currentUser.token,
                propertyContext,
                settingsContext.isScottish
              ).then((result) => {
                if (result) {
                  updatedCount.current++;
                  savedProperty.current.push(result);
                  setRangeProcessedCount(updatedCount.current + failedCount.current);
                }
              });
            } else {
              failedCount.current++;
            }
          }
        }
      }
    } else setUpdating(false);
  };

  useEffect(() => {
    if (isOpen && !showDialog) {
      setTitle("Add classification");
      setAction("add");
      setClassificationError(null);
      setStartDateError(null);
      setEndDateError(null);
      setHaveErrors(false);
      setNoteOpen(false);
      setCompleted(false);
      setUpdating(false);
    }

    setShowDialog(isOpen);
  }, [isOpen, showDialog]);

  useEffect(() => {
    const getErrorList = (currentErrors) => {
      const errorList = [];

      if (currentErrors.blpu && currentErrors.blpu.length > 0) {
        for (const error of currentErrors.blpu) {
          const errorStr = `BLPU [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.lpi && currentErrors.lpi.length > 0) {
        for (const error of currentErrors.lpi) {
          const errorStr = `LPI [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.provenance && currentErrors.provenance.length > 0) {
        for (const error of currentErrors.provenance) {
          const errorStr = `Provenance [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.crossRef && currentErrors.crossRef.length > 0) {
        for (const error of currentErrors.crossRef) {
          const errorStr = `Cross reference [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.classification && currentErrors.classification.length > 0) {
        for (const error of currentErrors.classification) {
          const errorStr = `Classification [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.organisation && currentErrors.organisation.length > 0) {
        for (const error of currentErrors.organisation) {
          const errorStr = `Organisation [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.successorCrossRef && currentErrors.successorCrossRef.length > 0) {
        for (const error of currentErrors.successorCrossRef) {
          const errorStr = `Successor cross reference [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.note && currentErrors.note.length > 0) {
        for (const error of currentErrors.note) {
          const errorStr = `Note [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      return errorList.join("\n");
    };

    if (
      propertyContext.currentPropertyHasErrors &&
      propertyContext.currentErrors &&
      propertyContext.currentErrors.pkId
    ) {
      if (!failedIds.current.includes(propertyContext.currentErrors.pkId)) {
        failedIds.current = [...failedIds.current, propertyContext.currentErrors.pkId];

        const failedAddress = properties.current
          ? properties.current.find((x) => x.id === propertyContext.currentErrors.pkId)
          : null;

        if (failedAddress) {
          if (updateErrors.current)
            updateErrors.current = [
              ...updateErrors.current,
              {
                id: propertyContext.currentErrors.pkId,
                uprn: failedAddress.uprn,
                address: failedAddress.address,
                errors: getErrorList(propertyContext.currentErrors),
              },
            ];
          else
            updateErrors.current = [
              {
                id: propertyContext.currentErrors.pkId,
                uprn: failedAddress.uprn,
                address: failedAddress.address,
                errors: getErrorList(propertyContext.currentErrors),
              },
            ];
          if (Array.isArray(updateErrors.current)) setFinaliseErrors(updateErrors.current);
          else setFinaliseErrors([updateErrors.current]);
        }

        failedCount.current++;
        setRangeProcessedCount(updatedCount.current + failedCount.current);
      }
    }
  }, [propertyContext.currentErrors, propertyContext.currentPropertyHasErrors]);

  useEffect(() => {
    if (totalUpdateCount.current > 0 && totalUpdateCount.current === updatedCount.current + failedCount.current) {
      setTitle("Add classification: completed");
      setHaveErrors(failedCount.current > 0);
      setCompleted(true);
      setUpdating(false);
    }
  }, [rangeProcessedCount]);

  return (
    <Dialog
      open={showDialog}
      aria-labelledby="multi-add-classification-dialog"
      fullWidth
      maxWidth="sm"
      onClose={handleDialogClose}
    >
      <DialogTitle
        id="multi-add-classification-dialog"
        sx={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: adsBlueA }}
      >
        <Typography variant="h6">{`${title}`}</Typography>
        <IconButton
          aria-label="close"
          onClick={handleCancelClick}
          sx={{ position: "absolute", right: 12, top: 12, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ marginTop: theme.spacing(2) }}>
        {!completed ? (
          <Fragment>
            <Typography variant="body1" gutterBottom>
              Enter the details for the classification to add to the selected properties
            </Typography>
            <Grid container justifyContent="center" alignItems="center">
              <Grid item xs={12}>
                <ADSSelectControl
                  label="Classification"
                  isEditable
                  isRequired
                  isClassification
                  includeHiddenCode
                  useRounded
                  doNotSetTitleCase
                  lookupData={OSGClassification}
                  lookupId="id"
                  lookupLabel="display"
                  lookupColour="colour"
                  value={classification}
                  errorText={classificationError}
                  onChange={handleClassificationChangeEvent}
                  helperText="Classification for the BLPU."
                />
              </Grid>
              <Grid item xs={12}>
                <ADSDateControl
                  label="Start date"
                  isEditable
                  isRequired
                  disabled={updating}
                  value={startDate}
                  helperText="Date of start of this classification record."
                  errorText={startDateError}
                  onChange={handleStartDateChangeEvent}
                />
              </Grid>
              <Grid item xs={12}>
                <ADSDateControl
                  label="End date"
                  isEditable
                  disabled={updating}
                  value={endDate}
                  helperText="Date on which this classification ceased to apply to the property."
                  errorText={endDateError}
                  onChange={handleEndDateChangeEvent}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl>
                  <FormLabel id="add-cross-reference-action-radio-buttons-group" sx={{ pt: "4px" }}>
                    <Typography variant="body2" sx={{ ml: "10px" }}>
                      If a property already has a classification?
                    </Typography>
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="add-cross-reference-action-radio-buttons-group"
                    name="cross-reference-action-radio-buttons-group"
                    value={action}
                    onChange={handleActionChangeEvent}
                  >
                    <FormControlLabel
                      value="keep"
                      control={<Radio />}
                      label={<Typography variant="body2">Keep existing and add new</Typography>}
                      sx={{ ml: "135px" }}
                    />
                    <FormControlLabel
                      value="delete"
                      control={<Radio />}
                      label={<Typography variant="body2">Delete existing and add new</Typography>}
                      sx={{ ml: "135px" }}
                    />
                    <FormControlLabel
                      value="historicise"
                      control={<Radio />}
                      label={<Typography variant="body2">Historicise existing and add new</Typography>}
                      sx={{ ml: "135px" }}
                    />
                    <FormControlLabel
                      value="update"
                      control={<Radio />}
                      label={<Typography variant="body2">Update existing</Typography>}
                      sx={{ ml: "135px" }}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {noteOpen && (
                <Grid item xs={12}>
                  <ADSTextControl
                    isEditable
                    disabled={updating}
                    value={note}
                    id={"ads-text-textfield-note"}
                    maxLength={4000}
                    minLines={2}
                    maxLines={10}
                    onChange={handleNoteChangeEvent}
                  />
                </Grid>
              )}
            </Grid>
          </Fragment>
        ) : (
          <Fragment>
            <Stack direction="column" spacing={1}>
              <Stack direction="row" justifyContent="flex-start" alignItems="flex-end" spacing={1}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 700, color: adsGreenC }}>
                  {updatedCount.current}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  properties were successfully updated
                </Typography>
              </Stack>
              {failedCount.current > 0 && (
                <Stack direction="column" spacing={1}>
                  <Stack direction="row" justifyContent="flex-start" alignItems="flex-end" spacing={1}>
                    <Typography variant="body1" gutterBottom sx={{ fontWeight: 700, color: adsRed }}>
                      {failedCount.current}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      properties were not updated:
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: "215px",
                      "& .idox-multi-add-classification-error-data-grid-header": {
                        backgroundColor: adsLightGreyC,
                        color: adsMidGreyA,
                      },
                      "& .idox-multi-add-classification-error-data-grid-error": {
                        color: adsRed,
                      },
                    }}
                    className={classes.root}
                  >
                    {finaliseErrors && finaliseErrors.length > 0 && (
                      <DataGrid
                        rows={finaliseErrors}
                        columns={columns}
                        autoPageSize
                        disableColumnMenu
                        disableSelectionOnClick
                        pagination
                        sortModel={sortModel}
                        selectionModel={selectionModel}
                        onSelectionModelChange={(newSelectionModel) => {
                          setSelectionModel(newSelectionModel);
                        }}
                        onSortModelChange={(model) => setSortModel(model)}
                      />
                    )}
                  </Box>
                </Stack>
              )}
            </Stack>
          </Fragment>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", marginBottom: theme.spacing(2) }}>
        {!completed ? (
          <Stack direction="column" spacing={3}>
            {!noteOpen && (
              <Button
                onClick={handleAddNoteClick}
                autoFocus
                disabled={updating}
                variant="contained"
                sx={whiteButtonStyle}
                startIcon={<NoteAddIcon />}
              >
                Add note
              </Button>
            )}
            <Button
              onClick={handleConfirmClick}
              autoFocus
              disabled={updating}
              variant="contained"
              sx={blueButtonStyle}
              startIcon={<DoneIcon />}
            >
              Confirm
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Button
              onClick={handleCloseClick}
              autoFocus
              variant="contained"
              sx={blueButtonStyle}
              startIcon={<DoneIcon />}
            >
              Close
            </Button>
            {failedCount.current > 0 && (
              <Button
                onClick={handleAddToListClick}
                autoFocus
                variant="contained"
                sx={whiteButtonStyle}
                startIcon={<PlaylistAddIcon />}
              >
                Add to list
              </Button>
            )}
          </Stack>
        )}
      </DialogActions>
      {updating && (
        <Backdrop open={updating}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </Dialog>
  );
}

export default MultiEditAddClassificationDialog;
