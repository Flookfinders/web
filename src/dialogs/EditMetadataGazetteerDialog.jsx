/* #region header */
/**************************************************************************************************
//
//  Description: Edit metadata gazetteer dialog
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
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    004   05.01.24 Sean Flook                 Use CSS shortcuts.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Grid, Typography, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSTextControl from "../components/ADSTextControl";
import ADSSelectControl from "../components/ADSSelectControl";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";

import { adsBlueA } from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

EditMetadataGazetteerDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(["street", "asd", "property"]).isRequired,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function EditMetadataGazetteerDialog({ isOpen, data, variant, onDone, onClose }) {
  const theme = useTheme();

  const [showDialog, setShowDialog] = useState(false);

  const [name, setName] = useState(null);
  const [scope, setScope] = useState(null);
  const [territory, setTerritory] = useState(null);
  const [metadataData, setMetadataData] = useState(null);
  const [owner, setOwner] = useState(null);
  const [frequency, setFrequency] = useState(null);

  const frequencyData = [
    { id: "D", text: "Daily" },
    { id: "W", text: "Weekly" },
    { id: "F", text: "Fortnightly" },
    { id: "M", text: "Monthly" },
  ];

  /**
   * Method to get the updated metadata data.
   *
   * @returns {object} The current metadata data.
   */
  const getUpdatedData = () => {
    if (variant === "property") {
      return {
        name: name,
        scope: scope,
        territory: territory,
        metadataData: metadataData,
        owner: owner,
        frequency: frequency,
      };
    } else {
      return {
        territory: territory,
        metadataData: metadataData,
        frequency: frequency,
      };
    }
  };

  /**
   * Event to handle when the done button is clicked.
   */
  const handleDoneClick = () => {
    if (onDone) onDone(getUpdatedData());
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
  };

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
   * Event to handle when the name changes.
   *
   * @param {string} newValue The new name.
   */
  const handleNameChangeEvent = (newValue) => {
    setName(newValue);
  };

  /**
   * Event to handle when the scope changes.
   *
   * @param {string} newValue The new scope.
   */
  const handleScopeChangeEvent = (newValue) => {
    setScope(newValue);
  };

  /**
   * Event to handle when the territory changes.
   *
   * @param {string} newValue The new territory.
   */
  const handleTerritoryChangeEvent = (newValue) => {
    setTerritory(newValue);
  };

  /**
   * Event to handle when the data changes.
   *
   * @param {string} newValue The new data.
   */
  const handleDataChangeEvent = (newValue) => {
    setMetadataData(newValue);
  };

  /**
   * Event to handle when the owner changes.
   *
   * @param {string} newValue The new owner.
   */
  const handleOwnerChangeEvent = (newValue) => {
    setOwner(newValue);
  };

  /**
   * Event to handle when the frequency changes.
   *
   * @param {string} newValue The new frequency.
   */
  const handleFrequencyChangeEvent = (newValue) => {
    setFrequency(newValue);
  };

  /**
   * Method to get the dialog title.
   *
   * @returns {string} The title.
   */
  const getTitle = () => {
    switch (variant) {
      case "street":
        return "Edit street gazetteer metadata";

      case "asd":
        return "Edit ASD gazetteer metadata";

      case "property":
        return "Edit property gazetteer metadata";

      default:
        return "";
    }
  };

  /**
   * Method to get the helper text for the controls.
   *
   * @param {string} control The control we need to helper text for.
   * @returns {string} The helper text for the control.
   */
  const getHelperText = (control) => {
    switch (control) {
      case "name":
        return "Name of the gazetteer. For example, LLPG for Camden.";

      case "scope":
        return "Description of the content of the gazetteer. For example, all basic property units with some land parcels.";

      case "territory":
        return "Geographic domain of the gazetteer.";

      case "data":
        switch (variant) {
          case "street":
            return "List of application dataset used to update the LSG.";

          case "asd":
            return "List of application dataset used to update the ASD.";

          case "property":
            return "List of application dataset used to update the LLPG.";

          default:
            return "";
        }

      case "owner":
        return "The organisation with overall responsibility for the gazetteer. This is the DCA Participating Authority for LLPG.";

      case "frequency":
        switch (variant) {
          case "street":
            return "Frequency with which LSG is maintained and sent to the NSG Custodian.";

          case "asd":
            return "Frequency with which LSG is maintained and sent to the NSG Custodian.";

          case "property":
            return "Frequency with which LLPG is maintained and sent to GeoPlace.";

          default:
            return "";
        }

      default:
        return "";
    }
  };

  useEffect(() => {
    if (data) {
      if (variant === "property") {
        setName(data.name);
        setScope(data.scope);
        setTerritory(data.territory);
        setMetadataData(data.metadataData);
        setOwner(data.owner);
        setFrequency(data.frequency);
      } else {
        setName(null);
        setScope(null);
        setTerritory(data.territory);
        setMetadataData(data.metadataData);
        setOwner(null);
        setFrequency(data.frequency);
      }
    }

    setShowDialog(isOpen);
  }, [variant, data, isOpen]);

  return (
    <div>
      <Dialog
        open={showDialog}
        aria-labelledby="edit-metadata-gazetteer-dialog"
        fullWidth
        maxWidth="md"
        onClose={handleDialogClose}
      >
        <DialogTitle
          id="edit-metadata-gazetteer-dialog"
          sx={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: adsBlueA }}
        >
          <Typography variant="h6">{getTitle()}</Typography>
          <IconButton
            aria-label="close"
            onClick={handleCancelClick}
            sx={{ position: "absolute", right: 12, top: 12, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: theme.spacing(2) }}>
          <Grid container justifyContent="flex-start" spacing={0} sx={{ pl: theme.spacing(3.5) }}>
            <Grid item xs={12}>
              <Stack direction="column" spacing={2}>
                <Box>
                  {variant === "property" && (
                    <ADSTextControl
                      label="Name"
                      isEditable
                      maxLength={60}
                      isRequired
                      value={name}
                      id={"metadata_name"}
                      helperText={getHelperText("name")}
                      onChange={handleNameChangeEvent}
                    />
                  )}
                  {variant === "property" && (
                    <ADSTextControl
                      label="Scope"
                      isEditable
                      maxLength={60}
                      isRequired
                      value={scope}
                      id={"metadata_scope"}
                      helperText={getHelperText("scope")}
                      onChange={handleScopeChangeEvent}
                    />
                  )}
                  <ADSTextControl
                    label="Territory"
                    isEditable
                    maxLength={60}
                    isRequired
                    value={territory}
                    id={"metadata_territory"}
                    helperText={getHelperText("territory")}
                    onChange={handleTerritoryChangeEvent}
                  />
                  <ADSTextControl
                    label="Data"
                    isEditable
                    maxLength={100}
                    value={metadataData}
                    id={"metadata_data"}
                    helperText={getHelperText("data")}
                    onChange={handleDataChangeEvent}
                  />
                  {variant === "property" && (
                    <ADSTextControl
                      label="Owner"
                      isEditable
                      maxLength={60}
                      isRequired
                      value={owner}
                      id={"metadata_owner"}
                      helperText={getHelperText("owner")}
                      onChange={handleOwnerChangeEvent}
                    />
                  )}
                  <ADSSelectControl
                    label="Frequency"
                    isEditable
                    isRequired
                    useRounded
                    lookupData={frequencyData}
                    lookupId="id"
                    lookupLabel="text"
                    value={frequency}
                    helperText={getHelperText("frequency")}
                    onChange={handleFrequencyChangeEvent}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(3) }}>
          <Button onClick={handleDoneClick} autoFocus variant="contained" sx={blueButtonStyle} startIcon={<DoneIcon />}>
            Done
          </Button>
          <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default EditMetadataGazetteerDialog;
