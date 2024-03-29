//#region header */
/**************************************************************************************************
//
//  Description: Street Page
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   20.07.21 Sean Flook         WI39??? Initial Revision.
//    002   23.08.23 Sean Flook       IMANN-159 Use the street template defaults whe getting a new street.
//    003   07.09.23 Sean Flook                 Cleaned the code.
//    004   06.10.23 Sean Flook                 Added lookupContext so it can be passed through to GetNewStreet.
//    005   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    006   25.01.24 Sean Flook                 Changes required after UX review.
//    007   26.01.24 Sean Flook       IMANN-232 Correctly initialise loadingRef.
//    008   14.02.24 Sean Flook                 Added a bit of error trapping.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

/* #region imports */

import React, { useContext, useState, useRef, useEffect } from "react";
import StreetContext from "../context/streetContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";
import MapContext from "../context/mapContext";
import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";
import { GetStreetByUSRNUrl } from "../configuration/ADSConfig";
import { GetNewStreet, GetMultipleEsusData } from "../utils/StreetUtils";
import { Grid } from "@mui/material";
import { EditConfirmationServiceProvider } from "./EditConfirmationPage";
import StreetDataForm from "../forms/StreetDataForm";
import ADSEsriMap from "../components/ADSEsriMap";

/* #endregion imports */

function StreetPage() {
  const streetContext = useContext(StreetContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);

  const [apiUrl, setApiUrl] = useState(null);
  const [data, setData] = useState();
  const dataUsrn = useRef(-1);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    async function SetUpStreetData() {
      if (
        !streetContext.currentStreet.newStreet &&
        streetContext.currentStreet.usrn &&
        streetContext.currentStreet.usrn > 0
      ) {
        if (apiUrl) {
          if (streetContext.currentStreet.usrn.toString() !== dataUsrn.current.toString()) {
            dataUsrn.current = streetContext.currentStreet.usrn;
            setLoading(true);
            loadingRef.current = true;
            console.log(
              "[DEBUG] fetching Street data",
              dataUsrn.current,
              `${apiUrl.url}/${streetContext.currentStreet.usrn}`
            );
            fetch(`${apiUrl.url}/${streetContext.currentStreet.usrn}`, {
              headers: apiUrl.headers,
              crossDomain: true,
              method: apiUrl.type,
            })
              .then((res) => (res.ok ? res : Promise.reject(res)))
              .then((res) => {
                switch (res.status) {
                  case 200:
                    return res.json();

                  case 204:
                    console.log("[DEBUG] SetUpStreetData: No content found");
                    return null;

                  case 401:
                    console.error(
                      "[401 ERROR] SetUpStreetData: Authorization details are not valid or have expired.",
                      res
                    );
                    return null;

                  case 403:
                    console.error("[402 ERROR] SetUpStreetData: You do not have database access.", res);
                    return null;

                  case 500:
                    console.error("[500 ERROR] SetUpStreetData: Unexpected server error.", res);
                    return null;

                  default:
                    console.error("[ERROR] SetUpStreetData: Unexpected error.", res);
                    return null;
                }
              })
              .then(
                (result) => {
                  setData(result);
                  sandboxContext.onUpdateAndClear("sourceStreet", result, "allStreet");
                },
                (error) => {
                  console.error("[ERROR] Get Street data", error);
                }
              )
              .then(() => {
                setLoading(false);
                loadingRef.current = false;
              });
          }
        }
      } else {
        if (streetContext.currentStreet.newStreet && dataUsrn.current.toString() !== "0" && !loadingRef.current) {
          setLoading(true);
          loadingRef.current = true;
          let newEsus = null;
          if (streetContext.createEsus && Array.isArray(streetContext.createEsus) && streetContext.createEsus.length) {
            newEsus = [];
            GetMultipleEsusData(streetContext.createEsus, userContext.currentUser.token).then((result) => {
              result.forEach((esu) => {
                newEsus.push({ ...esu, assignUnassign: 1 });
              });

              streetContext.onCreateStreet(null);

              generateNewStreet(newEsus);
            });
          } else {
            generateNewStreet(newEsus);
          }
        }
      }
    }

    const generateNewStreet = (newEsus) => {
      const newStreet = GetNewStreet(
        settingsContext.isScottish,
        settingsContext.isWelsh,
        settingsContext.authorityCode,
        settingsContext.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate.recordType
          ? settingsContext.streetTemplate.streetTemplate.recordType
          : null,
        !settingsContext.isScottish &&
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate.state
          ? settingsContext.streetTemplate.streetTemplate.state
          : null,
        settingsContext.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate.localityRef
          ? settingsContext.streetTemplate.streetTemplate.localityRef
          : null,
        settingsContext.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate.townRef
          ? settingsContext.streetTemplate.streetTemplate.townRef
          : null,
        settingsContext.isScottish &&
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate.islandRef
          ? settingsContext.streetTemplate.streetTemplate.islandRef
          : null,
        settingsContext.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate.adminAreaRef
          ? settingsContext.streetTemplate.streetTemplate.adminAreaRef
          : null,
        !settingsContext.isScottish &&
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate.classification
          ? settingsContext.streetTemplate.streetTemplate.classification
          : null,
        !settingsContext.isScottish &&
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate.streetSurface
          ? settingsContext.streetTemplate.streetTemplate.streetSurface
          : null,
        lookupContext,
        newEsus
      );
      setData(newStreet);
      sandboxContext.onUpdateAndClear("sourceStreet", newStreet, "allStreet");
      dataUsrn.current = 0;
      setLoading(false);
      loadingRef.current = false;
    };

    if (!apiUrl) {
      const streetUrl = GetStreetByUSRNUrl(userContext.currentUser.token, settingsContext.isScottish);
      setApiUrl(streetUrl);
    }

    SetUpStreetData();

    return () => {};
  }, [streetContext, sandboxContext, userContext, settingsContext, lookupContext, apiUrl]);

  return (
    <EditConfirmationServiceProvider>
      <div>
        <Grid container justifyContent="flex-start" spacing={0}>
          <Grid item xs={12}>
            <Grid container spacing={0} justifyContent="flex-start">
              <Grid item xs={12} sm={4}>
                <StreetDataForm data={data} loading={loading} />
              </Grid>
              <Grid item xs={12} sm={8}>
                <ADSEsriMap
                  startExtent={
                    mapContext.currentExtent
                      ? {
                          xmin: mapContext.currentExtent.xmin,
                          ymin: mapContext.currentExtent.ymin,
                          xmax: mapContext.currentExtent.xmax,
                          ymax: mapContext.currentExtent.ymax,
                          spatialReference: mapContext.currentExtent.spatialReference,
                        }
                      : null
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </EditConfirmationServiceProvider>
  );
}

export default StreetPage;
