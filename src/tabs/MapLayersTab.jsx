//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Confirm delete dialog
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001            Sean Flook                  Initial Revision.
//    002   27.06.23 Sean Flook          WI40757 Added in deletion confirmation dialog.
//    003   07.09.23 Sean Flook                  Removed unnecessary awaits.
//    004   06.10.23 Sean Flook                  Use colour variables.
//    005   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system.
//    006   08.12.23 Sean Flook                  Migrated DataGrid to v6.
//    007   02.01.24 Sean Flook                  Changed console.log to console.error for error messages.
//    008   05.01.24 Sean Flook                  Use CSS shortcuts.
//    009   10.01.24 Sean Flook                  Fix warnings.
//    010   22.03.24 Sean Flook            GLB12 Changed to use dataFormStyle so height can be correctly set.
//    011   27.03.24 Sean Flook                  Further changes to fix warnings.
//    012   20.05.24 Sean Flook        IMANN-445 Display API errors.
//    013   04.06.24 Sean Flook        IMANN-445 Show save data.
//    014   04.06.24 Sean Flook        IMANN-445 Only close the edit dialog if the save was successful.
//    015   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    016   10.09.24 Sean Flook        IMANN-980 Only write to the console if the user has the showMessages right.
//endregion Version 1.0.0.0
//region Version 1.0.5.0
//    017   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//    018   30.01.25 Sean Flook       IMANN-1673 Changes required for new user settings API.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useContext, useState, useRef, useEffect } from "react";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";

import { Typography, Button, Tooltip, Avatar } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { DataGrid } from "@mui/x-data-grid";
import ADSActionButton from "../components/ADSActionButton";

import EditMapLayersDialog from "../dialogs/EditMapLayersDialog";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";

import { GetMapLayersUrl } from "../configuration/ADSConfig";

import AddIcon from "@mui/icons-material/Add";
import LayersIcon from "@mui/icons-material/Layers";

import {
  adsBlueA,
  adsLightBlue,
  adsDarkGrey10,
  adsDarkGrey20,
  adsMagenta,
  adsDarkBlue,
  adsPaleBlueB,
} from "../utils/ADSColours";
import { blueButtonStyle, dataFormStyle, tooltipStyle } from "../utils/ADSStyles";
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

function MapLayersTab(props) {
  const theme = useTheme();
  const classes = useStyles();

  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);

  const [data, setData] = useState(null);
  const [gridData, setGridData] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [editData, setEditData] = useState({});
  const [showEditDialog, setShowEditDialog] = useState(false);

  const deletePkId = useRef(null);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [mapLayerErrors, setMapLayerErrors] = useState(null);

  const newLayer = useRef(false);

  /**
   * Method to display the action buttons for each row of the grid.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The actions buttons for the row.
   */
  const displayActionButtons = (params) => {
    const moveLayer = async (currentLayerPosition, newLayerPosition) => {
      const mapLayerApiUrl = GetMapLayersUrl("PATCH", userContext.currentUser);

      if (mapLayerApiUrl) {
        const isNewLayer = newLayer.current;

        if (userContext.currentUser.showMessages)
          console.log(
            "[DEBUG] moveLayer",
            `${mapLayerApiUrl.url}/${params.id}/${currentLayerPosition < newLayerPosition ? "MoveUp" : "MoveDown"}`
          );

        await fetch(
          `${mapLayerApiUrl.url}/${params.id}/${currentLayerPosition < newLayerPosition ? "MoveUp" : "MoveDown"}`,
          {
            headers: mapLayerApiUrl.headers,
            crossDomain: true,
            method: mapLayerApiUrl.type,
          }
        )
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then((result) => {
            const currentRecord = data.find((x) => x.pkId === params.id);
            const adjacentRecord = data.find((x) => x.layerPosition === newLayerPosition);

            const modifiedRecords =
              currentRecord && adjacentRecord
                ? [
                    {
                      pkId: currentRecord.pkId,
                      layerId: currentRecord.layerId,
                      layerType: currentRecord.layerType,
                      layerPosition: newLayerPosition,
                      url: currentRecord.url,
                      title: currentRecord.title,
                      copyright: currentRecord.copyright,
                      displayInList: currentRecord.displayInList,
                      visible: currentRecord.visible,
                      minScale: currentRecord.minScale,
                      maxScale: currentRecord.maxScale,
                      opacity: currentRecord.opacity,
                      esuSnap: currentRecord.esuSnap,
                      blpuSnap: currentRecord.blpuSnap,
                      extentSnap: currentRecord.extentSnap,
                      createdByUser: currentRecord.createdByUser,
                      globalLayer: currentRecord.globalLayer,
                      serviceProvider: currentRecord.serviceProvider,
                      geometryType: currentRecord.geometryType,
                      layerKey: currentRecord.layerKey,
                      layerUsername: currentRecord.layerUsername,
                      layerPassword: currentRecord.layerPassword,
                      activeLayerId: currentRecord.activeLayerId,
                      serviceMode: currentRecord.serviceMode,
                      propertyName: currentRecord.propertyName,
                      usePaging: currentRecord.usePaging,
                      maxBatchSize: currentRecord.maxBatchSize,
                    },
                    {
                      pkId: adjacentRecord.pkId,
                      layerId: adjacentRecord.layerId,
                      layerType: adjacentRecord.layerType,
                      layerPosition: currentLayerPosition,
                      url: adjacentRecord.url,
                      title: adjacentRecord.title,
                      copyright: adjacentRecord.copyright,
                      displayInList: adjacentRecord.displayInList,
                      visible: adjacentRecord.visible,
                      minScale: adjacentRecord.minScale,
                      maxScale: adjacentRecord.maxScale,
                      opacity: adjacentRecord.opacity,
                      esuSnap: adjacentRecord.esuSnap,
                      blpuSnap: adjacentRecord.blpuSnap,
                      extentSnap: adjacentRecord.extentSnap,
                      createdByUser: adjacentRecord.createdByUser,
                      globalLayer: adjacentRecord.globalLayer,
                      serviceProvider: adjacentRecord.serviceProvider,
                      geometryType: adjacentRecord.geometryType,
                      layerKey: adjacentRecord.layerKey,
                      layerUsername: adjacentRecord.layerUsername,
                      layerPassword: adjacentRecord.layerPassword,
                      activeLayerId: adjacentRecord.activeLayerId,
                      serviceMode: adjacentRecord.serviceMode,
                      propertyName: adjacentRecord.propertyName,
                      usePaging: adjacentRecord.usePaging,
                      maxBatchSize: adjacentRecord.maxBatchSize,
                    },
                  ]
                : null;

            if (modifiedRecords) {
              const updatedData = data.map((x) => modifiedRecords.find((rec) => rec.pkId === x.pkId) || x);
              settingsContext.onMapLayersChange(updatedData);
            }
          })
          .catch((res) => {
            switch (res.status) {
              case 400:
                res.json().then((body) => {
                  if (userContext.currentUser.showMessages)
                    console.error(`[400 ERROR] ${isNewLayer ? "Creating" : "Updating"} map layer`, body.errors);
                });
                break;

              case 401:
                useContext.onExpired();
                break;

              default:
                if (userContext.currentUser.showMessages)
                  console.error(
                    `[${res.status} ERROR] HandleDoneEditLayer - ${isNewLayer ? "Creating" : "Updating"} map layer.`,
                    res
                  );

                res.text().then((response) => {
                  if (userContext.currentUser.showMessages)
                    console.error(
                      `[${res.status} ERROR] HandleDoneEditLayer - ${isNewLayer ? "Creating" : "Updating"} map layer.`,
                      response,
                      res
                    );

                  const responseData = response.replace("[{", "").replace("}]", "").split(',"');

                  let errorTitle = "";
                  let errorDescription = "";

                  for (const errorData of responseData) {
                    if (errorData.includes("errorTitle")) errorTitle = errorData.substr(13).replace('"', "");
                    else if (errorData.includes("errorDescription"))
                      errorDescription = errorData.substr(19).replace('"', "");

                    if (errorTitle && errorTitle.length > 0 && errorDescription && errorDescription.length > 0) break;
                  }
                });
                break;
            }
          });
      }
    };

    const onMoveUpClick = (event) => {
      event.stopPropagation();
      moveLayer(params.row.layerPosition, params.row.layerPosition + 1);
    };

    const onMoveDownClick = (event) => {
      event.stopPropagation();
      moveLayer(params.row.layerPosition, params.row.layerPosition - 1);
    };

    const onEditClick = (event) => {
      doEditMapLayer(event, params.row.id);
    };

    const onDeleteClick = (event) => {
      doDeleteMapLayer(event, params.row.id);
    };

    return selectedRow && params.id > 0 && params.id === selectedRow ? (
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        <ADSActionButton
          id={`move-map-layer-up-${params.id}`}
          variant="moveUp"
          disabled={params.row.layerPosition === gridData.length}
          inheritBackground
          tooltipTitle={`Move layer up`}
          tooltipPlacement="bottom"
          onClick={onMoveUpClick}
        />
        <ADSActionButton
          id={`move-map-layer-down-${params.id}`}
          variant="moveDown"
          disabled={params.row.layerPosition === 1}
          inheritBackground
          tooltipTitle={`Move layer down`}
          tooltipPlacement="bottom"
          onClick={onMoveDownClick}
        />
        <ADSActionButton
          id={`edit-map-layer-${params.id}`}
          variant="edit"
          inheritBackground
          tooltipTitle={`Edit layer`}
          tooltipPlacement="bottom"
          onClick={onEditClick}
        />
        <ADSActionButton
          id={`delete-map-layer-${params.id}`}
          variant="deleteForever"
          inheritBackground
          tooltipTitle={`Delete layer forever`}
          tooltipPlacement="bottom"
          onClick={onDeleteClick}
        />
      </Stack>
    ) : null;
  };

  const mapLayerColumns = [
    {
      field: "id",
      headerClassName: "idox-data-grid-header",
      sortable: false,
      filterable: false,
    },
    {
      field: "layerType",
      headerClassName: "idox-data-grid-header",
      sortable: false,
      filterable: false,
    },
    {
      field: "layerPosition",
      headerClassName: "idox-data-grid-header",
      sortable: false,
      filterable: false,
    },
    {
      field: "title",
      headerName: "Layer",
      headerClassName: "idox-data-grid-header",
      sortable: false,
      filterable: false,
      display: "flex",
      flex: 70,
      renderCell: GetMapLayer,
    },
    {
      field: "visible",
      headerClassName: "idox-data-grid-header",
      sortable: false,
      filterable: false,
    },
    {
      field: "actions",
      type: "actions",
      headerClassName: "idox-data-grid-header",
      display: "flex",
      sortable: false,
      filterable: false,
      align: "left",
      flex: 15,
      renderCell: displayActionButtons,
    },
  ];

  const sortModel = [{ field: "layerPosition", sort: "desc" }];

  const stackStyle = { ml: theme.spacing(2), mt: theme.spacing(1), width: "55vw" };

  /**
   * Event to handle when the add button is clicked.
   */
  const doAddMapLayer = () => {
    newLayer.current = true;

    const newRecord = {
      pkId: data && data.length > 0 ? data.length + 1 : 1,
      layerId: "",
      layerType: "",
      layerPosition: data && data.length > 0 ? data.length + 1 : 1,
      url: "",
      title: "",
      copyright: "",
      displayInList: true,
      visible: true,
      minScale: 0,
      maxScale: 0,
      opacity: 1.0,
      esuSnap: false,
      blpuSnap: false,
      extentSnap: false,
      globalLayer: true,
      serviceProvider: "",
      geometryType: "",
      layerKey: "",
      layerUsername: "",
      layerPassword: "",
      activeLayerId: "",
      serviceMode: "",
      propertyName: "",
      usePaging: false,
      maxBatchSize: 100,
    };

    setMapLayerErrors(null);
    setEditData(newRecord);
    setShowEditDialog(true);
  };

  /**
   * Event to handle when a cell is clicked.
   *
   * @param {object} param The parameters passed by the grid.
   * @param {object} event The event object.
   */
  const handleCellClicked = (param, event) => {
    if (param && param.field !== "__check__" && param.field !== "" && param.field !== "actions" && param.id > 0) {
      doEditMapLayer(event, param.row.id);
    }
  };

  /**
   * Event to handle when the edit button is clicked.
   *
   * @param {object} event The event object.
   * @param {number} pkId The id of the map layer.
   */
  const doEditMapLayer = (event, pkId) => {
    event.stopPropagation();
    const editRecord = data.find((x) => x.pkId === pkId);
    if (editRecord) {
      setMapLayerErrors(null);
      setEditData(editRecord);
      setShowEditDialog(true);
    }
  };

  /**
   * Event to handle when the delete button is clicked.
   *
   * @param {object} event The event object.
   * @param {number} pkId The id of the map layer.
   */
  const doDeleteMapLayer = (event, pkId) => {
    event.stopPropagation();
    deletePkId.current = pkId;
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the deletion; otherwise false.
   */
  const handleCloseDeleteConfirmation = async (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);

    if (deleteConfirmed && deletePkId.current) {
      const mapLayerApiUrl = await GetMapLayersUrl("DELETE", userContext.currentUser);

      if (mapLayerApiUrl) {
        return await fetch(`${mapLayerApiUrl.url}/${deletePkId.current}`, {
          headers: mapLayerApiUrl.headers,
          crossDomain: true,
          method: mapLayerApiUrl.type,
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then((result) => {
            settingsContext.onMapLayersChange(data.filter((x) => x.pkId !== deletePkId.current));
          })
          .catch((res) => {
            switch (res.status) {
              case 400:
                res.json().then((body) => {
                  if (userContext.currentUser.showMessages)
                    console.error(`[400 ERROR] Deleting map layer`, body.errors);
                });
                break;

              case 401:
                userContext.onExpired();
                break;

              default:
                res.text().then((response) => {
                  if (userContext.currentUser.showMessages)
                    console.error(`[${res.status} ERROR] doDeleteMapLayer - Deleting map layer.`, response, res);

                  const responseData = response.replace("[{", "").replace("}]", "").split(',"');

                  let errorTitle = "";
                  let errorDescription = "";

                  for (const errorData of responseData) {
                    if (errorData.includes("errorTitle")) errorTitle = errorData.substr(13).replace('"', "");
                    else if (errorData.includes("errorDescription"))
                      errorDescription = errorData.substr(19).replace('"', "");

                    if (errorTitle && errorTitle.length > 0 && errorDescription && errorDescription.length > 0) break;
                  }
                });
                break;
            }
          });
      }
    }
  };

  /**
   * Method to get the data objects required to save the data.
   *
   * @param {object} sourceData The source data to save.
   * @returns {object} The object that can be passed to the API to be saved.
   */
  const getMapLayerSaveData = (sourceData) => {
    if (newLayer.current)
      return {
        layerId: sourceData.layerId,
        layerType: sourceData.layerType,
        layerPosition: sourceData.layerPosition,
        url: sourceData.url,
        title: sourceData.title,
        copyright: sourceData.copyright,
        displayInList: sourceData.displayInList,
        visible: sourceData.visible,
        minScale: sourceData.minScale,
        maxScale: sourceData.maxScale,
        opacity: sourceData.opacity,
        esuSnap: sourceData.esuSnap,
        blpuSnap: sourceData.blpuSnap,
        extentSnap: sourceData.extentSnap,
        globalLayer: sourceData.globalLayer,
        serviceProvider: sourceData.serviceProvider,
        geometryType: sourceData.geometryType,
        layerKey: sourceData.layerKey,
        layerUsername: sourceData.layerUsername,
        layerPassword: sourceData.layerPassword,
        activeLayerId: sourceData.activeLayerId,
        serviceMode: sourceData.serviceMode,
        propertyName: sourceData.propertyName,
        usePaging: sourceData.usePaging,
        maxBatchSize: sourceData.maxBatchSize,
      };
    else
      return {
        layerId: sourceData.layerId,
        layerType: sourceData.layerType,
        layerPosition: sourceData.layerPosition,
        url: sourceData.url,
        title: sourceData.title,
        copyright: sourceData.copyright,
        displayInList: sourceData.displayInList,
        visible: sourceData.visible,
        minScale: sourceData.minScale,
        maxScale: sourceData.maxScale,
        opacity: sourceData.opacity,
        esuSnap: sourceData.esuSnap,
        blpuSnap: sourceData.blpuSnap,
        extentSnap: sourceData.extentSnap,
        globalLayer: sourceData.globalLayer,
        serviceProvider: sourceData.serviceProvider,
        geometryType: sourceData.geometryType,
        layerKey: sourceData.layerKey,
        layerUsername: sourceData.layerUsername,
        layerPassword: sourceData.layerPassword,
        activeLayerId: sourceData.activeLayerId,
        serviceMode: sourceData.serviceMode,
        propertyName: sourceData.propertyName,
        usePaging: sourceData.usePaging,
        maxBatchSize: sourceData.maxBatchSize,
        pkId: sourceData.pkId,
      };
  };

  /**
   * Event to handle when a layer has been edited.
   *
   * @param {object} updatedData The data that has been changed.
   */
  const handleDoneEditLayer = async (updatedData) => {
    const mapLayerApiUrl = await GetMapLayersUrl(newLayer.current ? "POST" : "PUT", userContext.currentUser);
    const saveData = getMapLayerSaveData(updatedData);
    const isNewLayer = newLayer.current;

    if (mapLayerApiUrl) {
      if (userContext.currentUser.showMessages) console.log("[DEBUG] saveData", JSON.stringify(saveData));

      fetch(mapLayerApiUrl.url, {
        headers: mapLayerApiUrl.headers,
        crossDomain: true,
        method: mapLayerApiUrl.type,
        body: JSON.stringify(updatedData),
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => res.json())
        .then((result) => {
          let editedData = [];
          if (isNewLayer) {
            if (data && data.length > 0) {
              editedData = data.map((x) => x);
              editedData.push(result);
            } else editedData = [result];
          } else {
            if (data && data.length > 0) editedData = data.map((x) => [result].find((rec) => rec.pkId === x.pkId) || x);
            else editedData = [result];
          }
          settingsContext.onMapLayersChange(editedData);
          setShowEditDialog(false);
        })
        .catch((res) => {
          switch (res.status) {
            case 400:
              res.json().then((body) => {
                if (userContext.currentUser.showMessages)
                  console.error(`[400 ERROR] ${isNewLayer ? "Creating" : "Updating"} map layer`, body.errors);

                let errorMapLayer = [];

                for (const [key, value] of Object.entries(body.errors)) {
                  if (key.toLowerCase().includes("title")) {
                    errorMapLayer.push({ field: "Title", errors: value });
                  } else if (key.toLowerCase().includes("layertype")) {
                    errorMapLayer.push({ field: "LayerType", errors: value });
                  } else if (key.toLowerCase().includes("copyright")) {
                    errorMapLayer.push({ field: "Copyright", errors: value });
                  } else if (key.toLowerCase().includes("serviceprovider")) {
                    errorMapLayer.push({ field: "ServiceProvider", errors: value });
                  } else if (key.toLowerCase().includes("layerkey")) {
                    errorMapLayer.push({ field: "LayerKey", errors: value });
                  } else if (key.toLowerCase().includes("layerusername")) {
                    errorMapLayer.push({ field: "LayerUsername", errors: value });
                  } else if (key.toLowerCase().includes("layerpassword")) {
                    errorMapLayer.push({ field: "LayerPassword", errors: value });
                  } else if (key.toLowerCase().includes("activelayerid")) {
                    errorMapLayer.push({ field: "ActiveLayerId", errors: value });
                  } else if (key.toLowerCase().includes("servicemode")) {
                    errorMapLayer.push({ field: "ServiceMode", errors: value });
                  } else if (key.toLowerCase().includes("propertyname")) {
                    errorMapLayer.push({ field: "PropertyName", errors: value });
                  } else if (key.toLowerCase().includes("layerid")) {
                    errorMapLayer.push({ field: "LayerId", errors: value });
                  } else if (key.toLowerCase().includes("url")) {
                    errorMapLayer.push({ field: "Url", errors: value });
                  } else if (key.toLowerCase().includes("opacity")) {
                    errorMapLayer.push({ field: "Opacity", errors: value });
                  } else {
                    errorMapLayer.push({ field: key, errors: value });
                  }
                }

                if (errorMapLayer.length > 0) {
                  setMapLayerErrors(errorMapLayer);
                }
              });
              break;

            case 401:
              useContext.onExpired();
              setMapLayerErrors([
                {
                  field: "Title",
                  errors: [`You are not authorised to ${isNewLayer ? "create" : "update"} this map layer.`],
                },
              ]);
              res.json().then((body) => {
                if (userContext.currentUser.showMessages)
                  console.error(`[401 ERROR] ${isNewLayer ? "Creating" : "Updating"} map layer`, body);
              });
              break;

            default:
              if (userContext.currentUser.showMessages)
                console.error(
                  `[${res.status} ERROR] HandleDoneEditLayer - ${isNewLayer ? "Creating" : "Updating"} map layer.`,
                  res
                );

              res.text().then((response) => {
                if (userContext.currentUser.showMessages)
                  console.error(
                    `[${res.status} ERROR] HandleDoneEditLayer - ${isNewLayer ? "Creating" : "Updating"} map layer.`,
                    response,
                    res
                  );

                const responseData = response.replace("[{", "").replace("}]", "").split(',"');

                let errorTitle = "";
                let errorDescription = "";

                for (const errorData of responseData) {
                  if (errorData.includes("errorTitle")) errorTitle = errorData.substr(13).replace('"', "");
                  else if (errorData.includes("errorDescription"))
                    errorDescription = errorData.substr(19).replace('"', "");

                  if (errorTitle && errorTitle.length > 0 && errorDescription && errorDescription.length > 0) break;
                }

                setMapLayerErrors([
                  {
                    field: "Title",
                    errors: [`${errorTitle}: ${errorDescription}`],
                  },
                ]);
              });
              break;
          }
        });
    }

    newLayer.current = false;
  };

  /**
   * Event to handle when the data has been changed.
   *
   * @param {object} updatedData The data that has been changed.
   */
  const handleDataChanged = (updatedData) => {
    setEditData(updatedData);
  };

  /**
   * Event to handle when the list of errors has changed.
   *
   * @param {Array} mapLayerErrors The list of errors.
   */
  const handleErrorsChanged = (mapLayerErrors) => {
    setMapLayerErrors(mapLayerErrors);
  };

  /**
   * Event to handle when the edit dialog is closed.
   */
  const handleCloseEditDialog = () => {
    newLayer.current = false;
    setShowEditDialog(false);
  };

  /**
   * Method to get the map layer display.
   *
   * @param {object} params The parameters supplied by the grid.
   * @returns {JSX.Element} The display of the map layer.
   */
  function GetMapLayer(params) {
    if (params) {
      const mapLayerRecord = data.find((x) => x.pkId === params.id);
      if (mapLayerRecord) {
        if (mapLayerRecord.visible)
          return (
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-start">
              <Avatar
                variant={getAvatarVariant(params.row.layerType)}
                sx={getAvatarStyle(params.row.layerType, selectedRow && params.id > 0 && params.id === selectedRow)}
              >
                <LayersIcon />
              </Avatar>
              <Typography variant="body2">{params.value}</Typography>
            </Stack>
          );
        else
          return (
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-start">
              <Avatar
                variant={getAvatarVariant(params.row.layerType)}
                sx={getAvatarStyle(params.row.layerType, selectedRow && params.id > 0 && params.id === selectedRow)}
              >
                <LayersIcon />
              </Avatar>
              <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
                {params.value}
              </Typography>
            </Stack>
          );
      }
    }
  }

  /**
   * Event to handle when the mouse enters the row.
   *
   * @param {object} event The event object.
   */
  const handleRowMouseEnter = (event) => {
    event.preventDefault();
    setSelectedRow(Number(event.currentTarget.getAttribute("data-id")));
  };

  /**
   * Event to handle when the mouse leaves the row.
   */
  const handleRowMouseLeave = () => {
    setSelectedRow(null);
  };

  /**
   * Method to determine if the layer is visible or not.
   *
   * @param {number} id The id of the map layer.
   * @returns {boolean} True if the layer is visible; otherwise false.
   */
  const isRowVisible = (id) => {
    if (data && data.length > 0) {
      const visibleRow = data.filter((x) => x.pkId === id && x.visible);
      return visibleRow && visibleRow.length > 0;
    } else return false;
  };

  /**
   * Method to get the avatar variant.
   *
   * @param {number} type The type of map layer.
   * @returns {string} The variant for the avatar.
   */
  const getAvatarVariant = (type) => {
    switch (type) {
      case 1: // WFS
        return "circular";

      case 2: // WMS
        return "square";

      default: // WMTS
        return "rounded";
    }
  };

  /**
   * Method to get the styling for the avatar.
   *
   * @param {number} type The type of map layer.
   * @param {boolean} highlighted True if the map layer is highlighted; otherwise false.
   * @returns {object} The styling to use for the avatar.
   */
  const getAvatarStyle = (type, highlighted) => {
    if (highlighted)
      return {
        backgroundColor: adsBlueA,
        width: "24px",
        height: "24px",
        mt: "2px",
      };
    else {
      switch (type) {
        case 1: // WFS
          return {
            backgroundColor: adsLightBlue,
            width: "24px",
            height: "24px",
            mt: "2px",
          };

        case 2: // WMS
          return {
            backgroundColor: adsDarkBlue,
            width: "24px",
            height: "24px",
            mt: "2px",
          };

        default: // WMTS
          return {
            backgroundColor: adsMagenta,
            width: "24px",
            height: "24px",
            mt: "2px",
          };
      }
    }
  };

  useEffect(() => {
    if (settingsContext.mapLayers && settingsContext.mapLayers.length > 0) {
      setData(settingsContext.mapLayers);

      setGridData(
        settingsContext.mapLayers.map((x) => {
          return {
            id: x.pkId,
            layerType: x.layerType,
            layerPosition: x.layerPosition,
            title: x.title,
            visible: x.visible,
          };
        })
      );
    }
  }, [settingsContext.mapLayers]);

  return (
    <Box sx={{ ml: theme.spacing(1), mr: theme.spacing(4) }}>
      <Stack direction="column" spacing={2} sx={stackStyle}>
        <Stack direction="row" spacing={1}>
          <Typography sx={{ fontSize: 24, flexGrow: 1 }}>Map layers</Typography>
          <Tooltip title="Add new map layer" placement="top" sx={tooltipStyle} arrow>
            <Button variant="contained" sx={blueButtonStyle} startIcon={<AddIcon />} onClick={doAddMapLayer}>
              <Typography variant="body2">Map layer</Typography>
            </Button>
          </Tooltip>
        </Stack>
        <Box sx={dataFormStyle("MapLayersTab")} className={classes.root}>
          {gridData && gridData.length > 0 && (
            <DataGrid
              rows={gridData}
              columns={mapLayerColumns}
              initialState={{
                columns: {
                  columnVisibilityModel: {
                    id: false,
                    layerType: false,
                    layerPosition: false,
                    visible: false,
                  },
                },
              }}
              autoPageSize
              disableColumnMenu
              disableColumnSelector
              disableDensitySelector
              hideFooterSelectedRowCount
              editMode="row"
              pagination
              sortModel={sortModel}
              slotProps={{
                row: {
                  onMouseEnter: handleRowMouseEnter,
                  onMouseLeave: handleRowMouseLeave,
                },
              }}
              getRowClassName={(params) => `${isRowVisible(params.id) ? "visible-row" : "hidden-row"}`}
              onCellClick={handleCellClicked}
            />
          )}
        </Box>
      </Stack>
      <EditMapLayersDialog
        isOpen={showEditDialog}
        isNew={newLayer.current}
        data={editData}
        errors={mapLayerErrors}
        onDataChanged={handleDataChanged}
        onErrorsChanged={handleErrorsChanged}
        onDone={(updatedData) => handleDoneEditLayer(updatedData)}
        onClose={handleCloseEditDialog}
      />
      <ConfirmDeleteDialog variant="map layer" open={openDeleteConfirmation} onClose={handleCloseDeleteConfirmation} />
    </Box>
  );
}

export default MapLayersTab;
