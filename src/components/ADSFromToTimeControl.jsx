//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: From To time Control component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001   07.07.21 Sean Flook                  Initial Revision.
//    002   24.11.23 Sean Flook                  Moved Box to @mui/system.
//    003   08.12.23 Sean Flook                  Migrated TimePicker to v6.
//    004   22.12.23 Sean Flook                  Ensure tooltip is displayed
//    005   03.01.24 Sean Flook                  Fixed warning.
//    006   05.01.24 Sean Flook                  Use CSS shortcuts.
//    007   16.01.24 Sean Flook        IMANN-237 Added a clear button.
//    008   19.01.24 Sean Flook        IMANN-243 Correctly update the time.
//    009   16.02.24 Sean Flook        IMANN-243 Correctly handle the incoming time.
//    010   28.08.24 Sean Flook        IMANN-961 Use a TextField when user is read only.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    011   31.10.24 Sean Flook       IMANN-1012 Fix the height of the skeleton controls.
//endregion Version 1.0.1.0
//region Version 1.0.5.0
//    012   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

//region imports

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Grid2, Typography, Tooltip, Skeleton, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dateFormat from "dateformat";
import { parseISO, parse } from "date-fns";
import ADSErrorDisplay from "./ADSErrorDisplay";
import {
  FormBoxRowStyle,
  FormRowStyle,
  FormDateInputStyle,
  controlLabelStyle,
  tooltipStyle,
  FormInputStyle,
  skeletonHeight,
} from "../utils/ADSStyles";
import { isValidDate } from "../utils/HelperUtils";

//endregion imports

ADSFromToTimeControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  isFromFocused: PropTypes.bool,
  isToFocused: PropTypes.bool,
  loading: PropTypes.bool,
  fromLabel: PropTypes.string,
  toLabel: PropTypes.string,
  fromHelperText: PropTypes.string,
  toHelperText: PropTypes.string,
  fromValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  toValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  fromErrorText: PropTypes.array,
  toErrorText: PropTypes.array,
  onFromChange: PropTypes.func,
  onToChange: PropTypes.func,
};

ADSFromToTimeControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  isFromFocused: false,
  isToFocused: false,
  loading: false,
  fromLabel: "From",
  toLabel: "To",
};

function ADSFromToTimeControl({
  label,
  isEditable,
  isRequired,
  isFromFocused,
  isToFocused,
  loading,
  fromLabel,
  toLabel,
  fromHelperText,
  toHelperText,
  fromValue,
  toValue,
  fromErrorText,
  toErrorText,
  onFromChange,
  onToChange,
}) {
  const [selectedFromTime, setSelectedFromTime] = useState(null);
  const [selectedToTime, setSelectedToTime] = useState(null);
  const hasFromError = useRef(false);
  const hasToError = useRef(false);
  const [displayError, setDisplayError] = useState("");

  /**
   * Event to handle when the from time is changed.
   *
   * @param {Time} time The new time.
   */
  const handleFromChange = (time) => {
    const timeString = time ? dateFormat(new Date(time), "HH:MM:ss") : "";
    if (onFromChange) onFromChange(timeString);
    else setSelectedFromTime(time);
  };

  /**
   * Event to handle when the to time is changed.
   *
   * @param {Time} time The new time.
   */
  const handleToChange = (time) => {
    const timeString = time ? dateFormat(new Date(time), "HH:MM:ss") : "";
    if (onToChange) onToChange(timeString);
    else setSelectedToTime(time);
  };

  useEffect(() => {
    hasFromError.current = fromErrorText && fromErrorText.length > 0;
    hasToError.current = toErrorText && toErrorText.length > 0;

    let fromToTimeErrors = [];

    if (hasFromError.current) fromToTimeErrors = fromToTimeErrors.concat(fromErrorText);
    if (hasToError.current) fromToTimeErrors = fromToTimeErrors.concat(toErrorText);

    if (fromToTimeErrors.length > 0) setDisplayError(fromToTimeErrors.join(", "));
    else setDisplayError(null);
  }, [fromErrorText, toErrorText]);

  useEffect(() => {
    if (
      !loading &&
      fromValue &&
      fromValue.toString() !== "0001-01-01T00:00:00" &&
      fromValue.toString() !== "00:00:00"
    ) {
      if (isValidDate(fromValue)) setSelectedFromTime(fromValue);
      else
        setSelectedFromTime(fromValue.includes("T") ? parseISO(fromValue) : parse(fromValue, "HH:mm:ss", new Date()));
    }
    if (!loading && toValue && toValue.toString() !== "0001-01-01T00:00:00" && toValue.toString() !== "00:00:00") {
      if (isValidDate(toValue)) setSelectedFromTime(toValue);
      else setSelectedToTime(toValue.includes("T") ? parseISO(toValue) : parse(toValue, "HH:mm:ss", new Date()));
    }
  }, [loading, fromValue, toValue]);

  useEffect(() => {
    let element = null;

    if (isFromFocused) {
      element = document.getElementById(`${label.toLowerCase().replaceAll(" ", "-")}-from-time-picker-textfield`);
    } else if (isToFocused) {
      element = document.getElementById(`${label.toLowerCase().replaceAll(" ", "-")}-to-time-picker-textfield`);
    }

    if (element) element.focus();
  });

  return (
    <Box sx={FormBoxRowStyle(hasFromError.current || hasToError.current)}>
      <Grid2
        container
        justifyContent="flex-start"
        alignItems="center"
        sx={FormRowStyle(hasFromError.current || hasToError.current)}
      >
        <Grid2 size={3}>
          <Typography
            variant="body2"
            align="left"
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            sx={controlLabelStyle}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid2>
        <Grid2 size={9}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height={`${skeletonHeight}px`} width="100%" />
          ) : isEditable ? (
            <Grid2 container justifyContent="flex-start" alignItems="center" spacing={1}>
              <Grid2 container direction="column" size={6}>
                <Grid2>
                  <Typography variant="body2">{fromLabel}</Typography>
                </Grid2>
                <Grid2>
                  {fromHelperText && fromHelperText.length > 0 ? (
                    <Tooltip
                      title={isRequired ? fromHelperText + " This is a required field." : fromHelperText}
                      arrow
                      placement="right"
                      sx={tooltipStyle}
                    >
                      <div>
                        <TimePicker
                          id={`${label.toLowerCase().replaceAll(" ", "-")}-from-time-picker`}
                          value={selectedFromTime}
                          required={isRequired}
                          disabled={!isEditable}
                          slotProps={{
                            textField: {
                              id: `${label.toLowerCase().replaceAll(" ", "-")}-from-time-picker-textfield`,
                              sx: FormDateInputStyle(hasFromError.current),
                              variant: "outlined",
                              error: hasFromError.current,
                              margin: "dense",
                              fullWidth: true,
                              size: "small",
                            },
                            field: { clearable: true },
                          }}
                          onChange={(newValue) => handleFromChange(newValue)}
                          KeyboardButtonProps={{
                            "aria-label": "change from time",
                          }}
                          aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-from-time-label`}
                          aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-time-error`}
                        />
                      </div>
                    </Tooltip>
                  ) : (
                    <TimePicker
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-from-time-picker`}
                      value={selectedFromTime}
                      required={isRequired}
                      disabled={!isEditable}
                      slotProps={{
                        textField: {
                          id: `${label.toLowerCase().replaceAll(" ", "-")}-from-time-picker-textfield`,
                          sx: FormDateInputStyle(hasFromError.current),
                          variant: "outlined",
                          error: hasFromError.current,
                          margin: "dense",
                          fullWidth: true,
                          size: "small",
                        },
                        field: { clearable: true },
                      }}
                      onChange={(newValue) => handleFromChange(newValue)}
                      KeyboardButtonProps={{
                        "aria-label": "change from time",
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-from-time-label`}
                      aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-time-error`}
                    />
                  )}
                </Grid2>
              </Grid2>
              <Grid2 container direction="column" size={6}>
                <Grid2>
                  <Typography variant="body2">{toLabel}</Typography>
                </Grid2>
                <Grid2>
                  {toHelperText && toHelperText.length > 0 ? (
                    <Tooltip
                      title={isRequired ? toHelperText + " This is a required field." : toHelperText}
                      arrow
                      placement="right"
                      sx={tooltipStyle}
                    >
                      <div>
                        <TimePicker
                          id={`${label.toLowerCase().replaceAll(" ", "-")}-to-time-picker`}
                          value={selectedToTime}
                          required={isRequired}
                          disabled={!isEditable}
                          slotProps={{
                            textField: {
                              id: `${label.toLowerCase().replaceAll(" ", "-")}-to-time-picker-textfield`,
                              sx: FormDateInputStyle(hasToError.current),
                              variant: "outlined",
                              error: hasToError.current,
                              margin: "dense",
                              fullWidth: true,
                              size: "small",
                            },
                            field: { clearable: true },
                          }}
                          onChange={(newValue) => handleToChange(newValue)}
                          KeyboardButtonProps={{
                            "aria-label": "change to time",
                          }}
                          aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-to-time-label`}
                          aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-time-error`}
                        />
                      </div>
                    </Tooltip>
                  ) : (
                    <TimePicker
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-to-time-picker`}
                      value={selectedToTime}
                      required={isRequired}
                      disabled={!isEditable}
                      slotProps={{
                        textField: {
                          id: `${label.toLowerCase().replaceAll(" ", "-")}-to-time-picker-textfield`,
                          sx: FormDateInputStyle(hasToError.current),
                          variant: "outlined",
                          error: hasToError.current,
                          margin: "dense",
                          fullWidth: true,
                          size: "small",
                        },
                        field: { clearable: true },
                      }}
                      onChange={(newValue) => handleToChange(newValue)}
                      KeyboardButtonProps={{
                        "aria-label": "change to time",
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-to-time-label`}
                      aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-time-error`}
                    />
                  )}
                </Grid2>
              </Grid2>
            </Grid2>
          ) : (
            <Grid2 container justifyContent="flex-start" alignItems="center">
              <Grid2 container direction="column" size={6}>
                <Grid2>
                  <Typography variant="body2">{fromLabel}</Typography>
                </Grid2>
                <Grid2>
                  {selectedFromTime && selectedFromTime.toString() !== "0001-01-01T00:00:00" ? (
                    <TextField
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-from-time`}
                      sx={FormInputStyle(hasFromError.current)}
                      error={hasFromError.current}
                      rows={1}
                      fullWidth
                      disabled
                      required={isRequired}
                      variant="outlined"
                      margin="dense"
                      size="small"
                      value={dateFormat(selectedFromTime, "h:M tt")}
                    />
                  ) : (
                    <TextField
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-from-time`}
                      sx={FormInputStyle(hasFromError.current)}
                      error={hasFromError.current}
                      rows={1}
                      fullWidth
                      disabled
                      required={isRequired}
                      variant="outlined"
                      margin="dense"
                      size="small"
                      value={""}
                    />
                  )}
                </Grid2>
              </Grid2>
              <Grid2 container direction="column" size={6}>
                <Grid2>
                  <Typography variant="body2">{toLabel}</Typography>
                </Grid2>
                <Grid2>
                  {selectedToTime && selectedToTime.toString() !== "0001-01-01T00:00:00" ? (
                    <TextField
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-to-time`}
                      sx={FormInputStyle(hasToError.current)}
                      error={hasToError.current}
                      rows={1}
                      fullWidth
                      disabled
                      required={isRequired}
                      variant="outlined"
                      margin="dense"
                      size="small"
                      value={dateFormat(selectedToTime, "h:M tt")}
                    />
                  ) : (
                    <TextField
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-to-time`}
                      sx={FormInputStyle(hasToError.current)}
                      error={hasToError.current}
                      rows={1}
                      fullWidth
                      disabled
                      required={isRequired}
                      variant="outlined"
                      margin="dense"
                      size="small"
                      value={dateFormat(selectedToTime, "h:M tt")}
                    />
                  )}
                </Grid2>
              </Grid2>
            </Grid2>
          )}
        </Grid2>
        <ADSErrorDisplay
          errorText={displayError}
          id={`${label.toLowerCase().replaceAll(" ", "-")}-from-to-time-error`}
        />
      </Grid2>
    </Box>
  );
}

export default ADSFromToTimeControl;
