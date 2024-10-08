/* #region header */
/**************************************************************************************************
//
//  Description: Help Drawer component
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
//    002   26.04.23 Sean Flook         WI40697 Updated contact information.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    005   05.01.24 Sean Flook                 Use CSS shortcuts.
//    006   11.03.24 Sean Flook           GLB12 Correctly set width.
//    007   02.04.24 Sean Flook                 Keep title in view when overflowing.
//    008   21.05.24 Sean Flook                 Updated support email address.
//    009   26.06.24 Peter Bryden               Added in help reference.
//    010   04.07.24 Sean Flook                 Updated URL for the help for new location.
//    011   29.08.24 Sean Flook       IMANN-965 Updated wording.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";

import { copyTextToClipboard } from "../utils/HelperUtils";

import { Drawer, Typography, Link, Grid, IconButton } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";

import ForumIcon from "@mui/icons-material/ForumOutlined";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import CallIcon from "@mui/icons-material/CallOutlined";
import CircleIcon from "@mui/icons-material/Circle";
import HelpIcon from "@mui/icons-material/HelpOutline";

import { CopyIcon, SupportAgentIcon } from "../utils/ADSIcons";
import { adsMidGreyA, adsOffWhite } from "../utils/ADSColours";
import {
  drawerWidth,
  ActionIconStyle,
  drawerTitleStyle,
  drawerSubTitleStyle,
  drawerTextStyle,
  drawerLinkStyle,
  drawerSmallTextStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

/* #endregion imports */

ADSHelpDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  handleDrawerClose: PropTypes.func.isRequired,
};

function ADSHelpDrawer({ open, handleDrawerClose }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);

  const [guiVersion, setGuiVersion] = useState(null);
  const [apiVersion, setApiVersion] = useState(null);
  const [coreVersion, setCoreVersion] = useState(null);
  const [lookupVersion, setLookupVersion] = useState(null);
  const [settingsVersion, setSettingsVersion] = useState(null);
  const [iManageDbVersion, setIManageDbVersion] = useState(null);
  const [iExchangeDbVersion, setIExchangeDbVersion] = useState(null);
  const [iValidateDbVersion, setIValidateDbVersion] = useState(null);
  const [indexDBServer, setIndexDBServer] = useState(null);
  const [indexDBName, setIndexDBName] = useState(null);
  const [indexBuiltOn, setIndexBuiltOn] = useState(null);
  const [indexElasticVersion, setIndexElasticVersion] = useState(null);

  /**
   * Method to copy the metadata information to the clipboard.
   *
   * @param {object} event The event object.
   */
  const copyMetadataInfo = (event) => {
    event.stopPropagation();

    let copyString = `iManage Cloud metadata information\n`;
    copyString += `==================================\n`;
    copyString += `\n`;
    copyString += `GUI version: ${guiVersion}\n`;
    copyString += `API versions\n`;
    copyString += `------------\n`;
    copyString += `  iManage: ${apiVersion}\n`;
    copyString += `  Core: ${coreVersion}\n`;
    copyString += `  Lookups: ${lookupVersion}\n`;
    copyString += `  Settings: ${settingsVersion}\n`;
    copyString += `Database versions\n`;
    copyString += `-----------------\n`;
    copyString += `  iManage: ${iManageDbVersion}\n`;
    copyString += `  iExchange: ${iExchangeDbVersion}\n`;
    copyString += `  iValidate: ${iValidateDbVersion}\n`;
    copyString += `Search index\n`;
    copyString += `------------\n`;
    copyString += `  Db server: ${indexDBServer}\n`;
    copyString += `  Db name: ${indexDBName}\n`;
    copyString += `  Built on: ${indexBuiltOn}\n`;
    copyString += `  Elastic version: ${indexElasticVersion}\n`;

    copyTextToClipboard(copyString);
  };

  /**
   * Method to get the metadata information to be displayed.
   *
   * @param {string} information The information to display.
   * @returns {JSX.Element} The information to be displayed.
   */
  const getMetadataInformation = (information) => {
    return (
      <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1} sx={{ pl: "8px" }}>
        <CircleIcon sx={{ width: "8px", height: "8px", color: adsMidGreyA }} />
        <Typography align={"left"} variant="body2" sx={drawerSmallTextStyle}>
          {information}
        </Typography>
      </Stack>
    );
  };

  useEffect(() => {
    if (lookupContext.metadata) {
      setGuiVersion(lookupContext.metadata.guiVersion);
      setApiVersion(lookupContext.metadata.apiVersion);
      setCoreVersion(lookupContext.metadata.coreVersion);
      setLookupVersion(lookupContext.metadata.lookupVersion);
      setSettingsVersion(lookupContext.metadata.settingsVersion);
      setIManageDbVersion(lookupContext.metadata.iManageDbVersion);
      setIExchangeDbVersion(lookupContext.metadata.iExchangeDbVersion);
      setIValidateDbVersion(lookupContext.metadata.iValidateDbVersion);
      setIndexDBServer(lookupContext.metadata.indexDBServer);
      setIndexDBName(lookupContext.metadata.indexDBName);
      setIndexBuiltOn(lookupContext.metadata.indexBuiltOn);
      setIndexElasticVersion(lookupContext.metadata.indexElasticVersion);
    }

    return () => {};
  }, [lookupContext]);

  return (
    <Drawer
      sx={{
        width: `${drawerWidth}px`,
        anchor: "right",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: `${drawerWidth}px`,
        },
      }}
      variant="persistent"
      anchor="right"
      open={open}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          // necessary for content to be below app bar
          ...theme.mixins.toolbar,
          justifyContent: "flex-start",
        }}
      >
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h6" noWrap sx={drawerTitleStyle}>
              Help and support
            </Typography>
          </Grid>
          <Grid item>
            <ADSActionButton
              variant="close"
              tooltipTitle="Close help"
              tooltipPlacement="left"
              onClick={handleDrawerClose}
            />
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ overflowY: "auto", backgroundColor: adsOffWhite }}>
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
          sx={{
            pl: "24px",
          }}
        >
          <Grid item xs={12} sx={{ pt: "24px" }}>
            <Typography align="left" variant="subtitle1" sx={drawerSubTitleStyle}>
              Get help
            </Typography>
          </Grid>

          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            sx={{
              pt: theme.spacing(1),
            }}
          >
            <Grid item xs={1}>
              <HelpIcon
                sx={{
                  color: adsMidGreyA,
                  display: "inline-flex",
                }}
              />
            </Grid>
            <Grid item>
              <Typography align="left" variant="subtitle2" sx={drawerTextStyle}>
                Help Documentation
                <br />
                <Link
                  align={"left"}
                  href="https://imanage-help.idoxcloud.com"
                  target="_blank"
                  rel="noopener"
                  variant="body2"
                >
                  Browse our Help
                </Link>
              </Typography>
            </Grid>
          </Grid>

          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            sx={{
              pt: theme.spacing(1),
            }}
          >
            <Grid item xs={1}>
              <ForumIcon
                sx={{
                  color: adsMidGreyA,
                  display: "inline-flex",
                }}
              />
            </Grid>
            <Grid item>
              <Typography align="left" variant="subtitle2" sx={drawerTextStyle}>
                Customer portal
                <br />
                <Link
                  align={"left"}
                  href="https://customer.hornbill.com/idoxsd/"
                  target="_blank"
                  rel="noopener"
                  variant="body2"
                >
                  Log a support call and search knowledge base.
                </Link>
              </Typography>
            </Grid>
          </Grid>
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            sx={{
              pt: theme.spacing(1),
            }}
          >
            <Grid item xs={1}>
              <SupportAgentIcon
                sx={{
                  color: adsMidGreyA,
                  display: "inline-flex",
                }}
              />
            </Grid>
            <Grid item>
              <Typography align="left" variant="subtitle2" sx={drawerTextStyle}>
                Contact support <br />
                <Link
                  align={"left"}
                  href="mailto:servicedesk@idoxgroup.com?subject=Support enquiry raised from iManage Cloud Help"
                  variant="body2"
                >
                  Email the Service Desk
                </Link>
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} sx={{ pt: "40px" }}>
            <Typography align="left" variant="subtitle1" sx={drawerSubTitleStyle}>
              General enquiries
            </Typography>
          </Grid>
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            sx={{
              pt: theme.spacing(1),
            }}
          >
            <Grid item xs={1}>
              <EmailIcon
                sx={{
                  color: adsMidGreyA,
                  display: "inline-flex",
                }}
              />
            </Grid>
            <Grid
              item
              sx={{
                display: "inline-flex",
              }}
            >
              <Link
                align={"left"}
                href="mailto:ads.solutions@idoxgroup.com?subject=Solutions enquiry raised from iManage Cloud Help"
                variant="body2"
              >
                ads.solutions@idoxgroup.com
              </Link>
            </Grid>
          </Grid>
          <Grid container direction="row" justifyContent="flex-start" alignItems="center">
            <Grid item xs={1}>
              <CallIcon
                sx={{
                  color: adsMidGreyA,
                  display: "inline-flex",
                }}
              />
            </Grid>
            <Grid item>
              <Typography align={"left"} variant="body2" sx={drawerTextStyle}>
                +44 (0) 3330 111 567
              </Typography>
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              pt: theme.spacing(1),
            }}
          >
            <Typography align={"left"} variant="body2" sx={drawerTextStyle}>
              Idox Software Ltd
            </Typography>
            <Typography align={"left"} variant="body2" sx={drawerTextStyle}>
              Unit 5 Woking 8
            </Typography>
            <Typography align={"left"} variant="body2" sx={drawerTextStyle}>
              Forsyth Road
            </Typography>
            <Typography align={"left"} variant="body2" sx={drawerTextStyle}>
              Woking
            </Typography>
            <Typography align={"left"} variant="body2" sx={drawerTextStyle}>
              Surrey
            </Typography>
            <Typography align={"left"} variant="body2" sx={drawerTextStyle}>
              GU21 5SB
            </Typography>
          </Grid>
          <Grid item xs={12} sx={{ pt: "40px" }}>
            <Typography align="left" variant="subtitle1" sx={drawerSubTitleStyle}>
              Metadata information
            </Typography>
          </Grid>
          <Grid container direction="row" justifyContent="flex-start" alignItems="center">
            <Grid item xs={12}>
              <Typography
                align={"left"}
                variant="body2"
                sx={{
                  color: adsMidGreyA,
                  fontSize: "16px",
                  pt: theme.spacing(2),
                }}
              >
                {`GUI version: ${guiVersion}`}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                align={"left"}
                variant="subtitle2"
                sx={{
                  color: adsMidGreyA,
                  fontSize: "16px",
                  pt: theme.spacing(0.5),
                }}
              >
                API versions
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {getMetadataInformation(`iManage: ${apiVersion}`)}
            </Grid>
            <Grid item xs={12}>
              {getMetadataInformation(`Core: ${coreVersion}`)}
            </Grid>
            <Grid item xs={12}>
              {getMetadataInformation(`Lookups: ${lookupVersion}`)}
            </Grid>
            <Grid item xs={12}>
              {getMetadataInformation(`Settings: ${settingsVersion}`)}
            </Grid>
            <Grid item xs={12}>
              <Typography
                align={"left"}
                variant="subtitle2"
                sx={{
                  color: adsMidGreyA,
                  fontSize: "16px",
                  pt: theme.spacing(0.5),
                }}
              >
                Database versions
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {getMetadataInformation(`iManage: ${iManageDbVersion}`)}
            </Grid>
            <Grid item xs={12}>
              {getMetadataInformation(`iExchange: ${iExchangeDbVersion}`)}
            </Grid>
            <Grid item xs={12}>
              {getMetadataInformation(`iValidate: ${iValidateDbVersion}`)}
            </Grid>
            <Grid item xs={12}>
              <Typography
                align={"left"}
                variant="subtitle2"
                sx={{
                  color: adsMidGreyA,
                  fontSize: "16px",
                  pt: theme.spacing(0.5),
                }}
              >
                Search index
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {getMetadataInformation(`Db server: ${indexDBServer}`)}
            </Grid>
            <Grid item xs={12}>
              {getMetadataInformation(`Db name: ${indexDBName}`)}
            </Grid>
            <Grid item xs={12}>
              {getMetadataInformation(`Built on: ${indexBuiltOn}`)}
            </Grid>
            <Grid item xs={12}>
              {getMetadataInformation(`Elastic version: ${indexElasticVersion}`)}
            </Grid>
            <Grid item xs={1}>
              <IconButton onClick={(event) => copyMetadataInfo(event)} size="small" sx={{ color: adsMidGreyA }}>
                <CopyIcon sx={ActionIconStyle()} />
              </IconButton>
            </Grid>
            <Grid
              item
              sx={{
                display: "inline-flex",
              }}
            >
              <Link
                component="button"
                align={"left"}
                variant="body2"
                onClick={(event) => copyMetadataInfo(event)}
                sx={drawerLinkStyle}
              >
                Copy metadata information
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Drawer>
  );
}

export default ADSHelpDrawer;
