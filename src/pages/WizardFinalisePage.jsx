import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import MapContext from "../context/mapContext";

import { Box, Grid, Backdrop, CircularProgress } from "@mui/material";
import ADSWizardMap from "../components/ADSWizardMap";
import ADSWizardAddressList from "../components/ADSWizardAddressList";

WizardFinalisePage.propTypes = {
  data: PropTypes.array.isRequired,
  isChild: PropTypes.bool,
  errors: PropTypes.array,
  creating: PropTypes.bool,
  onDataChange: PropTypes.func.isRequired,
  onErrorChanged: PropTypes.func.isRequired,
};

WizardFinalisePage.defaultProps = {
  isChild: false,
  creating: false,
};

function WizardFinalisePage({ data, isChild, errors, creating, onDataChange, onErrorChanged }) {
  const mapContext = useContext(MapContext);

  const [checked, setChecked] = useState([]);

  /**
   * Event to handle updating the list of checked records.
   *
   * @param {Array} updatedChecked The list of checked records.
   */
  const handleCheckedChanged = (updatedChecked) => {
    setChecked(updatedChecked);
  };

  /**
   * Event to handle when the data has been changed.
   *
   * @param {object} updatedData The updated data.
   */
  const handleDataChanged = (updatedData) => {
    if (onDataChange) onDataChange(updatedData);
  };

  /**
   * Event to handle when the list of errors changes.
   *
   * @param {Array} finaliseErrors The list of errors.
   */
  const handleErrorChanged = (finaliseErrors) => {
    if (onErrorChanged) onErrorChanged(finaliseErrors);
  };

  useEffect(() => {
    if (mapContext.currentPinSelected) setChecked([mapContext.currentPinSelected]);
    else setChecked([]);
  }, [mapContext.currentPinSelected]);

  return (
    <Box>
      <Grid container justifyContent="flex-start" spacing={0}>
        <Grid item xs={12}>
          <Grid container spacing={0} justifyContent="flex-start">
            <Grid item xs={12} sm={4}>
              <ADSWizardAddressList
                data={data}
                checked={checked}
                errors={errors}
                onCheckedChanged={handleCheckedChanged}
                onDataChanged={handleDataChanged}
                onErrorChanged={handleErrorChanged}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <ADSWizardMap data={data} isChild={isChild} isRange />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {creating && (
        <Backdrop open={creating}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </Box>
  );
}

export default WizardFinalisePage;
