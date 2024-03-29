/* #region header */
/**************************************************************************************************
//
//  Description: Street descriptor tab
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial version.
//    002   27.10.23 Sean Flook                 Use new dataFormStyle.
//    003   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    004   19.12.23 Sean Flook                 Various bug fixes.
//    005   05.01.24 Sean Flook                 Changes to sort out warnings.
//    006   10.01.24 Sean Flook                 Fix warnings.
//    007   11.01.24 Sean Flook                 Fix warnings.
//    008   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    009   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    010   13.03.24 Joshua McCormick IMANN-280 Added dataTabToolBar for inner toolbar styling
//    011   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import LookupContext from "../context/lookupContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import SettingsContext from "../context/settingsContext";
import { streetToTitleCase } from "../utils/StreetUtils";
import ObjectComparison, { streetDescriptorKeysToIgnore } from "./../utils/ObjectComparison";
import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSLanguageControl from "../components/ADSLanguageControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import { useTheme } from "@mui/styles";
import { toolbarStyle, dataTabToolBar, dataFormStyle } from "../utils/ADSStyles";

StreetDescriptorDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onHomeClick: PropTypes.func.isRequired,
};

function StreetDescriptorDataTab({ data, errors, loading, focusedField, onHomeClick }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [language, setLanguage] = useState("ENG");
  const [description, setDescription] = useState("");
  const [locality, setLocality] = useState(null);
  const [town, setTown] = useState(null);
  const [island, setIsland] = useState(null);
  const [administrativeArea, setAdministrativeArea] = useState(null);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [languageError, setLanguageError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);
  const [localityError, setLocalityError] = useState(null);
  const [townError, setTownError] = useState(null);
  const [islandError, setIslandError] = useState(null);
  const [administrativeAreaError, setAdministrativeAreaError] = useState(null);

  /**
   * Update the sandbox street descriptor record.
   *
   * @param {string} field The name of the field to update with the new value.
   * @param {string|number|boolean|Date|null} newValue The new value for the given field to update.
   */
  const UpdateSandbox = (field, newValue) => {
    const newDescriptorData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("streetDescriptor", newDescriptorData);
  };

  /**
   * Event to handle when the language flag changes.
   *
   * @param {string|null} newValue The new language flag.
   */
  const handleLanguageChangeEvent = (newValue) => {
    setLanguage(newValue);
    UpdateSandbox("language", newValue);
  };

  /**
   * Event to handle when the description changes.
   *
   * @param {string|null} newValue The new description value.
   */
  const handleDescriptionChangeEvent = (newValue) => {
    setDescription(newValue);
    UpdateSandbox("description", newValue);
  };

  /**
   * Event to handle the locality changes.
   *
   * @param {number|null} newValue The new locality reference.
   */
  const handleLocalityChangeEvent = (newValue) => {
    setLocality(newValue);
    UpdateSandbox("locality", newValue);
  };

  /**
   * Event to handle the town changes.
   *
   * @param {number|null} newValue The new town reference.
   */
  const handleTownChangeEvent = (newValue) => {
    setTown(newValue);
    UpdateSandbox("town", newValue);
  };

  /**
   * Event to handle the island changes.
   *
   * @param {number|null} newValue The new island reference
   */
  const handleIslandChangeEvent = (newValue) => {
    setIsland(newValue);
    UpdateSandbox("island", newValue);
  };

  /**
   * Event to handle the administrative area changes.
   *
   * @param {number|null} newValue The new administrative area reference.
   */
  const handleAdministrativeAreaChangeEvent = (newValue) => {
    setAdministrativeArea(newValue);
    UpdateSandbox("administrativeArea", newValue);
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceDescriptor =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.streetDescriptors.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      onHomeClick(
        dataChanged
          ? sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor
            ? "check"
            : "discard"
          : "discard",
        sourceDescriptor,
        sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor);
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.sdData) {
        setLanguage(data.sdData.language ? data.sdData.language : "ENG");
        setDescription(data.sdData.streetDescriptor ? data.sdData.streetDescriptor : "");
        setLocality(data.sdData.locRef);
        setTown(data.sdData.townRef);
        setIsland(data.sdData.islandName);
        setAdministrativeArea(data.sdData.adminAreaRef);
      }
    }
    if (onHomeClick) onHomeClick("discard", data.sdData, null);
  };

  /**
   * Function to return the current descriptor record.
   *
   * @param {string} field The name of the field to update with the new value.
   * @param {string|number|boolean|Date|null} newValue The new value for the given field to update.
   * @returns {object} The current descriptor record.
   */
  function GetCurrentData(field, newValue) {
    if (settingsContext.isScottish)
      return {
        pkId: data.sdData.pkId,
        changeType: field && field === "changeType" ? newValue : data.sdData.pkId <= -10 ? "I" : "U",
        usrn: data.sdData.usrn,
        streetDescriptor: field && field === "description" ? newValue : description,
        locRef: field && field === "locality" ? newValue : locality,
        locality: data.sdData.locality,
        townRef: field && field === "town" ? newValue : town,
        town: data.sdData.town,
        islandRef: field && field === "island" ? newValue : island,
        island: data.sdData.island,
        adminAreaRef: field && field === "administrativeArea" ? newValue : administrativeArea,
        administrativeArea: data.sdData.administrativeArea,
        language: field && field === "language" ? newValue : language,
        neverExport: data.sdData.neverExport,
      };
    else
      return {
        pkId: data.sdData.pkId,
        changeType: field && field === "changeType" ? newValue : data.sdData.pkId <= -10 ? "I" : "U",
        usrn: data.sdData.usrn,
        streetDescriptor: field && field === "description" ? newValue : description,
        locRef: field && field === "locality" ? newValue : locality,
        locality: data.sdData.locality,
        townRef: field && field === "town" ? newValue : town,
        town: data.sdData.town,
        adminAreaRef: field && field === "administrativeArea" ? newValue : administrativeArea,
        administrativeArea: data.sdData.administrativeArea,
        language: field && field === "language" ? newValue : language,
        neverExport: data.sdData.neverExport,
      };
  }

  useEffect(() => {
    if (!loading && data && data.sdData) {
      setLanguage(data.sdData.language ? data.sdData.language : "ENG");
      setDescription(data.sdData.streetDescriptor ? data.sdData.streetDescriptor : "");
      setLocality(data.sdData.locRef);
      setTown(data.sdData.townRef);
      setIsland(data.sdData.islandRef);
      setAdministrativeArea(data.sdData.adminAreaRef);
    }
  }, [loading, data]);

  useEffect(() => {
    if (
      sandboxContext.currentSandbox.sourceStreet &&
      sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor
    ) {
      const sourceDescriptor = sandboxContext.currentSandbox.sourceStreet.streetDescriptors.find(
        (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor.pkId
      );

      if (sourceDescriptor) {
        setDataChanged(
          !ObjectComparison(
            sourceDescriptor,
            sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor,
            streetDescriptorKeysToIgnore
          )
        );
      } else if (sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor.pkId < 0) setDataChanged(true);
    }
  }, [sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor, sandboxContext.currentSandbox.sourceStreet]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    setLanguageError(null);
    setDescriptionError(null);
    setLocalityError(null);
    setTownError(null);
    setIslandError(null);
    setAdministrativeAreaError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "language":
            setLanguageError(error.errors);
            break;

          case "streetdescriptor":
            setDescriptionError(error.errors);
            break;

          case "locref":
          case "locality":
            setLocalityError(error.errors);
            break;

          case "townref":
          case "town":
            setTownError(error.errors);
            break;

          case "islandref":
          case "island":
            setIslandError(error.errors);
            break;

          case "adminarearef":
          case "administrativearea":
            setAdministrativeAreaError(error.errors);
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
        <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={dataTabToolBar}>
          <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
          <Typography
            sx={{
              flexGrow: 1,
              display: "none",
              [theme.breakpoints.up("sm")]: {
                display: "block",
              },
            }}
            variant="subtitle1"
            noWrap
            align="left"
          >
            {`| ${data.index + 1} of ${data.totalRecords}: ${streetToTitleCase(description)}`}
          </Typography>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("StreetDescriptorDataTab")}>
        <ADSLanguageControl
          label="Language"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "Language" : false}
          loading={loading}
          value={language}
          errorText={languageError}
          helperText="The language in use for the descriptive identifier."
          onChange={handleLanguageChangeEvent}
        />
        <ADSTextControl
          id="street_descriptor"
          label="Name or descriptor"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "StreetDescriptor" : !description || description.length === 0}
          loading={loading}
          value={description}
          errorText={descriptionError}
          characterSet={
            settingsContext.isScottish
              ? "OneScotlandStreet"
              : data.streetType === 1
              ? "GeoPlaceStreet2"
              : "GeoPlaceStreet1"
          }
          helperText="This is the name/descriptor for this street."
          maxLength={100}
          onChange={handleDescriptionChangeEvent}
        />
        <ADSSelectControl
          label="Locality"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "LocRef" || focusedField === "Locality" : false}
          loading={loading}
          useRounded
          lookupData={lookupContext.currentLookups.localities.filter((x) => x.language === language && !x.historic)}
          lookupId="localityRef"
          lookupLabel="locality"
          value={locality}
          errorText={localityError}
          onChange={handleLocalityChangeEvent}
          helperText="Locality name."
        />
        <ADSSelectControl
          label="Town"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "TownRef" || focusedField === "Town" : false}
          loading={loading}
          useRounded
          lookupData={lookupContext.currentLookups.towns.filter((x) => x.language === language && !x.historic)}
          lookupId="townRef"
          lookupLabel="town"
          value={town}
          errorText={townError}
          onChange={handleTownChangeEvent}
          helperText="Town name."
        />
        {settingsContext.isScottish && (
          <ADSSelectControl
            label="Island"
            isEditable={userCanEdit}
            isFocused={focusedField ? focusedField === "IslandRef" || focusedField === "Island" : false}
            loading={loading}
            useRounded
            lookupData={lookupContext.currentLookups.islands.filter((x) => x.language === language && !x.historic)}
            lookupId="islandRef"
            lookupLabel="island"
            value={island}
            errorText={islandError}
            onChange={handleIslandChangeEvent}
            helperText="Island name."
          />
        )}
        <ADSSelectControl
          label="Admin area"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "AdminAreaRef" || focusedField === "AdministrativeArea" : false}
          loading={loading}
          useRounded
          lookupData={lookupContext.currentLookups.adminAuthorities.filter(
            (x) => x.language === language && !x.historic
          )}
          lookupId="administrativeAreaRef"
          lookupLabel="administrativeArea"
          value={administrativeArea}
          errorText={administrativeAreaError}
          onChange={handleAdministrativeAreaChangeEvent}
          helperText="Administrative area name."
        />
        <ADSOkCancelControl
          okDisabled={!dataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
    </Fragment>
  );
}

export default StreetDescriptorDataTab;
