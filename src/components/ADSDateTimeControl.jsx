/* #region header */
/**************************************************************************************************
//
//  Description: Date Time control
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
//    002   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    003   08.12.23 Sean Flook                 Migrated DatePicker to v6.
//    004   18.12.23 Sean Flook                 Ensure tooltip is displayed
//    005   20.12.23 Sean Flook       IMANN-201 Added the isDateRequired and isTimeRequired properties.
//    006   03.01.24 Sean Flook                 Fixed warning.
//    007   05.01.24 Sean Flook                 use CSS shortcuts.
//    008   16.01.24 Sean Flook       IMANN-237 Added a clear button.
//    009   19.01.24 Sean Flook       IMANN-243 Correctly update the time.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import dateFormat from "dateformat";
import { parseISO } from "date-fns";
import { isValidDate } from "../utils/HelperUtils";

import { Grid, Typography, Tooltip, Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import ADSErrorDisplay from "./ADSErrorDisplay";

import { adsMidGreyA } from "../utils/ADSColours";
import { FormBoxRowStyle, FormRowStyle, FormDateInputStyle, tooltipStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

/* #endregion imports */

ADSDateTimeControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  isDateRequired: PropTypes.bool,
  isTimeRequired: PropTypes.bool,
  isDateFocused: PropTypes.bool,
  isTimeFocused: PropTypes.bool,
  allowFutureDates: PropTypes.bool,
  loading: PropTypes.bool,
  dateHelperText: PropTypes.string,
  timeHelperText: PropTypes.string,
  dateValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  timeValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  dateErrorText: PropTypes.array,
  timeErrorText: PropTypes.array,
  onDateChange: PropTypes.func,
  onTimeChange: PropTypes.func,
};

ADSDateTimeControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  isDateRequired: false,
  isTimeRequired: false,
  isDateFocused: false,
  isTimeFocused: false,
  allowFutureDates: false,
  loading: false,
};

function ADSDateTimeControl({
  label,
  isEditable,
  isRequired,
  isDateRequired,
  isTimeRequired,
  isDateFocused,
  isTimeFocused,
  allowFutureDates,
  loading,
  dateHelperText,
  timeHelperText,
  dateValue,
  timeValue,
  dateErrorText,
  timeErrorText,
  onDateChange,
  onTimeChange,
}) {
  const theme = useTheme();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const hasDateError = useRef(false);
  const hasTimeError = useRef(false);
  const [displayError, setDisplayError] = useState("");

  /**
   * Event to handle when the date is changed.
   *
   * @param {Date} date The new date.
   */
  const handleDateChange = (date) => {
    setSelectedDate(date);

    if (onDateChange) onDateChange(date);
  };

  /**
   * Event to handle when the time is changed.
   *
   * @param {Time} time The new time.
   */
  const handleTimeChange = (time) => {
    const timeString = time ? dateFormat(new Date(time), "HH:MM:ss") : "";
    if (onTimeChange) onTimeChange(timeString);
    else setSelectedTime(time);
  };

  useEffect(() => {
    hasDateError.current = dateErrorText && dateErrorText.length > 0;
    hasTimeError.current = timeErrorText && timeErrorText.length > 0;

    let dateTimeError = [];

    if (hasDateError.current) dateTimeError = dateTimeError.concat(dateErrorText);
    if (hasTimeError.current) dateTimeError = dateTimeError.concat(timeErrorText);

    if (dateTimeError.length > 0) setDisplayError(dateTimeError.join(", "));
    else setDisplayError("");
  }, [dateErrorText, timeErrorText]);

  useEffect(() => {
    if (!loading && dateValue && dateValue.toString() !== "0001-01-01T00:00:00") {
      if (isValidDate(dateValue)) setSelectedDate(dateValue);
      else setSelectedDate(parseISO(dateValue));
    }
    if (!loading && timeValue) {
      if (isValidDate(timeValue)) setSelectedTime(timeValue);
      else setSelectedTime(parseISO(timeValue));
    }
  }, [loading, dateValue, timeValue]);

  useEffect(() => {
    let element = null;

    if (isDateFocused) {
      element = document.getElementById(`${label.toLowerCase().replaceAll(" ", "-")}-date-picker-textfield`);
    } else if (isTimeFocused) {
      element = document.getElementById(`${label.toLowerCase().replaceAll(" ", "-")}-time-picker-textfield`);
    }

    if (element) element.focus();
  });

  return (
    <Box sx={FormBoxRowStyle(hasDateError.current || hasTimeError.current)}>
      <Grid
        container
        justifyContent="flex-start"
        alignItems="center"
        sx={FormRowStyle(hasDateError.current || hasTimeError.current)}
      >
        <Grid item xs={3}>
          <Typography
            variant="body2"
            align="left"
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            sx={{ fontSize: "14px", color: adsMidGreyA, pt: "24px" }}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid>
        <Grid item xs={9}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height="52px" width="100%" />
          ) : isEditable ? (
            <Grid container justifyContent="flex-start" alignItems="center" spacing={1}>
              <Grid item xs={6} container direction="column">
                <Grid item>
                  <Typography variant="body2">{`Date${isDateRequired ? "*" : ""}`}</Typography>
                </Grid>
                <Grid item>
                  {dateHelperText && dateHelperText.length > 0 ? (
                    <Tooltip
                      title={isRequired ? dateHelperText + " This is a required field." : dateHelperText}
                      arrow
                      placement="right"
                      sx={tooltipStyle}
                    >
                      <div>
                        <DatePicker
                          id={`${label.toLowerCase().replaceAll(" ", "-")}-date-picker`}
                          format="dd MMMM yyyy"
                          disableMaskedInput
                          value={selectedDate}
                          showTodayButton
                          required={isRequired}
                          disabled={!isEditable}
                          disableFuture={!allowFutureDates}
                          slotProps={{
                            textField: {
                              id: `${label.toLowerCase().replaceAll(" ", "-")}-date-picker-textfield`,
                              sx: FormDateInputStyle(hasDateError.current),
                              variant: "outlined",
                              error: hasDateError.current,
                              margin: "dense",
                              fullWidth: true,
                              size: "small",
                            },
                            field: { clearable: true },
                          }}
                          onChange={(newValue) => handleDateChange(newValue)}
                          KeyboardButtonProps={{
                            "aria-label": "change date",
                          }}
                          aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                          aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-error`}
                        />
                      </div>
                    </Tooltip>
                  ) : (
                    <DatePicker
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-date-picker`}
                      format="dd MMMM yyyy"
                      disableMaskedInput
                      value={selectedDate}
                      showTodayButton
                      required={isRequired}
                      disabled={!isEditable}
                      disableFuture={!allowFutureDates}
                      slotProps={{
                        textField: {
                          id: `${label.toLowerCase().replaceAll(" ", "-")}-date-picker-textfield`,
                          sx: FormDateInputStyle(hasDateError.current),
                          variant: "outlined",
                          error: hasDateError.current,
                          margin: "dense",
                          fullWidth: true,
                          size: "small",
                        },
                        field: { clearable: true },
                      }}
                      onChange={(newValue) => handleDateChange(newValue)}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-date-label`}
                      aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-date-error`}
                    />
                  )}
                </Grid>
              </Grid>
              <Grid item xs={6} container direction="column">
                <Grid item>
                  <Typography variant="body2">{`Time${isTimeRequired ? "*" : ""}`}</Typography>
                </Grid>
                <Grid item>
                  {timeHelperText && timeHelperText.length > 0 ? (
                    <Tooltip
                      title={isRequired ? timeHelperText + " This is a required field." : timeHelperText}
                      arrow
                      placement="right"
                      sx={tooltipStyle}
                    >
                      <div>
                        <TimePicker
                          id={`${label.toLowerCase().replaceAll(" ", "-")}-time-picker`}
                          value={selectedTime}
                          required={isRequired}
                          disabled={!isEditable}
                          slotProps={{
                            textField: {
                              id: `${label.toLowerCase().replaceAll(" ", "-")}-time-picker-textfield`,
                              sx: FormDateInputStyle(hasTimeError.current),
                              variant: "outlined",
                              error: hasTimeError.current,
                              margin: "dense",
                              fullWidth: true,
                              size: "small",
                            },
                            field: { clearable: true },
                          }}
                          onChange={(newValue) => handleTimeChange(newValue)}
                          KeyboardButtonProps={{
                            "aria-label": "change time",
                          }}
                          aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-time-label`}
                          aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-time-error`}
                        />
                      </div>
                    </Tooltip>
                  ) : (
                    <TimePicker
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-time-picker`}
                      value={selectedTime}
                      required={isRequired}
                      disabled={!isEditable}
                      slotProps={{
                        textField: {
                          id: `${label.toLowerCase().replaceAll(" ", "-")}-time-picker-textfield`,
                          sx: FormDateInputStyle(hasTimeError.current),
                          variant: "outlined",
                          error: hasTimeError.current,
                          margin: "dense",
                          fullWidth: true,
                          size: "small",
                        },
                        field: { clearable: true },
                      }}
                      onChange={(newValue) => handleTimeChange(newValue)}
                      KeyboardButtonProps={{
                        "aria-label": "change time",
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-time-label`}
                      aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-time-error`}
                    />
                  )}
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Grid container justifyContent="flex-start" alignItems="center">
              <Grid item xs={6} container direction="column">
                <Grid item>
                  <Typography variant="body2">{`Date${isDateRequired ? "*" : ""}`}</Typography>
                </Grid>
                <Grid item>
                  {selectedDate && selectedDate.toString() !== "0001-01-01T00:00:00" && (
                    <Typography
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-date`}
                      variant="body1"
                      align="left"
                      sx={{
                        pl: theme.spacing(2),
                        pt: theme.spacing(1.75),
                        pb: theme.spacing(1.75),
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                    >
                      {dateFormat(selectedDate, "d mmm yyyy")}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={6} container direction="column">
                <Grid item>
                  <Typography variant="body2">{`Time${isTimeRequired ? "*" : ""}`}</Typography>
                </Grid>
                <Grid item>
                  {selectedTime && selectedTime.toString() !== "0001-01-01T00:00:00" && (
                    <Typography
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-time`}
                      variant="body1"
                      align="left"
                      sx={{
                        pl: theme.spacing(2),
                        pt: theme.spacing(1.75),
                        pb: theme.spacing(1.75),
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-time-label`}
                    >
                      {dateFormat(selectedTime, "h:M tt")}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-date-time-error`} />
      </Grid>
    </Box>
  );
}

export default ADSDateTimeControl;
