/* #region header */
/**************************************************************************************************
//
//  Description: From To date Control component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   07.07.21 Sean Flook                 Initial Revision.
//    002   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    003   08.12.23 Sean Flook                 Migrated DatePicker to v6.
//    004   18.12.23 Sean Flook                 Ensure tooltip is displayed
//    005   03.01.24 Sean Flook                 Fixed warning.
//    006   05.01.24 Sean Flook                 Use CSS shortcuts.
//    007   16.01.24 Sean Flook       IMANN-237 Added a clear button.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Grid, Typography, Tooltip, Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dateFormat from "dateformat";
import { parseISO } from "date-fns";
import { isValidDate } from "../utils/HelperUtils";
import ADSErrorDisplay from "./ADSErrorDisplay";
import { useTheme } from "@mui/styles";
import { FormBoxRowStyle, FormRowStyle, FormDateInputStyle, controlLabelStyle, tooltipStyle } from "../utils/ADSStyles";

/* #endregion imports */

ADSFromToDateControl.propTypes = {
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

ADSFromToDateControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  isFromFocused: false,
  isToFocused: false,
  loading: false,
  fromLabel: "From",
  toLabel: "To",
};

function ADSFromToDateControl({
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
  const theme = useTheme();

  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);
  const hasFromError = useRef(false);
  const hasToError = useRef(false);
  const [displayError, setDisplayError] = useState("");

  /**
   * Event to handle when the from date is changed.
   *
   * @param {Date} date The new date.
   */
  const handleFromChange = (date) => {
    setSelectedFromDate(date);

    if (onFromChange) onFromChange(date);
  };

  /**
   * Event to handle when the to date is changed.
   *
   * @param {Date} date The new date.
   */
  const handleToChange = (date) => {
    setSelectedToDate(date);

    if (onToChange) onToChange(date);
  };

  useEffect(() => {
    hasFromError.current = fromErrorText && fromErrorText.length > 0;
    hasToError.current = toErrorText && toErrorText.length > 0;

    let fromToDateErrors = [];

    if (hasFromError.current) fromToDateErrors = fromToDateErrors.concat(fromErrorText);
    if (hasToError.current) fromToDateErrors = fromToDateErrors.concat(toErrorText);

    if (fromToDateErrors.length > 0) setDisplayError(fromToDateErrors.join(", "));
    else setDisplayError(null);
  }, [fromErrorText, toErrorText]);

  useEffect(() => {
    if (!loading && fromValue && fromValue.toString() !== "0001-01-01T00:00:00") {
      if (isValidDate(fromValue)) setSelectedFromDate(fromValue);
      else setSelectedFromDate(parseISO(fromValue));
    }
    if (!loading && toValue && toValue.toString() !== "0001-01-01T00:00:00") {
      if (isValidDate(toValue)) setSelectedToDate(toValue);
      else setSelectedToDate(parseISO(toValue));
    }
  }, [loading, fromValue, toValue]);

  useEffect(() => {
    let element = null;

    if (isFromFocused) {
      element = document.getElementById(`${label.toLowerCase().replaceAll(" ", "-")}-from-date-picker-textfield`);
    } else if (isToFocused) {
      element = document.getElementById(`${label.toLowerCase().replaceAll(" ", "-")}-to-date-picker-textfield`);
    }

    if (element) element.focus();
  });

  return (
    <Box sx={FormBoxRowStyle(hasFromError.current || hasToError.current)}>
      <Grid
        container
        justifyContent="flex-start"
        alignItems="center"
        sx={FormRowStyle(hasFromError.current || hasToError.current)}
      >
        <Grid item xs={3}>
          <Typography
            variant="body2"
            align="left"
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            sx={controlLabelStyle}
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
                  <Typography variant="body2">{fromLabel}</Typography>
                </Grid>
                <Grid item>
                  {fromHelperText && fromHelperText.length > 0 ? (
                    <Tooltip
                      title={isRequired ? fromHelperText + " This is a required field." : fromHelperText}
                      arrow
                      placement="right"
                      sx={tooltipStyle}
                    >
                      <div>
                        <DatePicker
                          id={`${label.toLowerCase().replaceAll(" ", "-")}-from-date-picker`}
                          format="dd MMMM yyyy"
                          disableMaskedInput
                          value={selectedFromDate}
                          showTodayButton
                          required={isRequired}
                          disabled={!isEditable}
                          slotProps={{
                            textField: {
                              id: `${label.toLowerCase().replaceAll(" ", "-")}-from-date-picker-textfield`,
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
                            "aria-label": "change from date",
                          }}
                          aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-from-date-label`}
                          aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-error`}
                        />
                      </div>
                    </Tooltip>
                  ) : (
                    <DatePicker
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-from-date-picker`}
                      format="dd MMMM yyyy"
                      disableMaskedInput
                      value={selectedFromDate}
                      showTodayButton
                      required={isRequired}
                      disabled={!isEditable}
                      slotProps={{
                        textField: {
                          id: `${label.toLowerCase().replaceAll(" ", "-")}-from-date-picker-textfield`,
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
                        "aria-label": "change from date",
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-from-date-label`}
                      aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-date-error`}
                    />
                  )}
                </Grid>
              </Grid>
              <Grid item xs={6} container direction="column">
                <Grid item>
                  <Typography variant="body2">{toLabel}</Typography>
                </Grid>
                <Grid item>
                  {toHelperText && toHelperText.length > 0 ? (
                    <Tooltip
                      title={isRequired ? toHelperText + " This is a required field." : toHelperText}
                      arrow
                      placement="right"
                      sx={tooltipStyle}
                    >
                      <div>
                        <DatePicker
                          id={`${label.toLowerCase().replaceAll(" ", "-")}-to-date-picker`}
                          format="dd MMMM yyyy"
                          disableMaskedInput
                          value={selectedToDate}
                          showTodayButton
                          required={isRequired}
                          disabled={!isEditable}
                          slotProps={{
                            textField: {
                              id: `${label.toLowerCase().replaceAll(" ", "-")}-to-date-picker-textfield`,
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
                            "aria-label": "change to date",
                          }}
                          aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-to-date-label`}
                          aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-error`}
                        />
                      </div>
                    </Tooltip>
                  ) : (
                    <DatePicker
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-to-date-picker`}
                      format="dd MMMM yyyy"
                      disableMaskedInput
                      value={selectedToDate}
                      showTodayButton
                      required={isRequired}
                      disabled={!isEditable}
                      slotProps={{
                        textField: {
                          id: `${label.toLowerCase().replaceAll(" ", "-")}-to-date-picker-textfield`,
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
                        "aria-label": "change to date",
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-to-date-label`}
                      aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-date-error`}
                    />
                  )}
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Grid container justifyContent="flex-start" alignItems="center">
              <Grid item xs={6} container direction="column">
                <Grid item>
                  <Typography variant="body2">{fromLabel}</Typography>
                </Grid>
                <Grid item>
                  {selectedFromDate && selectedFromDate.toString() !== "0001-01-01T00:00:00" && (
                    <Typography
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-from-date`}
                      variant="body1"
                      align="left"
                      sx={{
                        pl: theme.spacing(2),
                        pt: theme.spacing(1.75),
                        pb: theme.spacing(1.75),
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-from-label`}
                    >
                      {dateFormat(selectedFromDate, "d mmm yyyy")}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={6} container direction="column">
                <Grid item>
                  <Typography variant="body2">{toLabel}</Typography>
                </Grid>
                <Grid item>
                  {selectedToDate && selectedToDate.toString() !== "0001-01-01T00:00:00" && (
                    <Typography
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-to-date`}
                      variant="body1"
                      align="left"
                      sx={{
                        pl: theme.spacing(2),
                        pt: theme.spacing(1.75),
                        pb: theme.spacing(1.75),
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-to-label`}
                    >
                      {dateFormat(selectedToDate, "d mmm yyyy")}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
        <ADSErrorDisplay
          errorText={displayError}
          id={`${label.toLowerCase().replaceAll(" ", "-")}-from-to-date-error`}
        />
      </Grid>
    </Box>
  );
}

export default ADSFromToDateControl;
