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
//    009   05.04.24 Sean Flook                 Correctly handle errors when getting a street.
//    010   05.04.24 Sean Flook       IMANN-351 Changes to handle browser navigation.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

/* #region imports */

import React, { useContext, useState, useRef, useEffect } from "react";
import { useLocation } from "react-router";

import StreetContext from "../context/streetContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";
import MapContext from "../context/mapContext";
import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";

import { GetStreetByUSRNUrl } from "../configuration/ADSConfig";
import { GetNewStreet, GetMultipleEsusData } from "../utils/StreetUtils";
import { StreetRoute } from "../PageRouting";

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

  const location = useLocation();

  const [apiUrl, setApiUrl] = useState(null);
  const [data, setData] = useState();
  const dataUsrn = useRef(-1);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    async function SetUpStreetData(urlUsrn) {
      if (urlUsrn && urlUsrn !== "0") {
        if (apiUrl) {
          if (urlUsrn !== dataUsrn.current) {
            dataUsrn.current = urlUsrn;
            setLoading(true);
            loadingRef.current = true;
            console.log("[DEBUG] fetching Street data", dataUsrn.current, `${apiUrl.url}/${urlUsrn}`);
            fetch(`${apiUrl.url}/${urlUsrn}`, {
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
                    streetContext.onStreetErrors(
                      [
                        {
                          field: "USRN",
                          errors: ["This street no longer exists in the database."],
                        },
                      ],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      []
                    );
                    return null;

                  case 401:
                    streetContext.onStreetErrors(
                      [
                        {
                          field: "USRN",
                          errors: ["Authorization details are not valid or have expired."],
                        },
                      ],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      []
                    );
                    return null;

                  case 403:
                    streetContext.onStreetErrors(
                      [
                        {
                          field: "USRN",
                          errors: ["You do not have database access."],
                        },
                      ],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      []
                    );
                    return null;

                  case 500:
                    streetContext.onStreetErrors(
                      [
                        {
                          field: "USRN",
                          errors: ["Unexpected server error, please report to support."],
                        },
                      ],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      []
                    );
                    console.error("[500 ERROR] SetUpStreetData: Unexpected server error.", res);
                    return null;

                  default:
                    streetContext.onStreetErrors(
                      [
                        {
                          field: "USRN",
                          errors: ["Unexpected error, please report to support."],
                        },
                      ],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      []
                    );
                    console.error("[ERROR] SetUpStreetData: Unexpected error.", res);
                    return null;
                }
              })
              .then(
                (result) => {
                  setData(result);
                  if (
                    urlUsrn &&
                    (!streetContext.currentStreet || streetContext.currentStreet.usrn.toString() !== urlUsrn)
                  )
                    streetContext.onUpdateCurrentStreet(
                      Number(urlUsrn),
                      result.streetDescriptors && result.streetDescriptors.length
                        ? result.streetDescriptors.filter((x) => x.language === "ENG")[0].streetDescriptor
                        : "",
                      false
                    );
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
        if (urlUsrn && urlUsrn === "0" && dataUsrn.current !== "0" && !loadingRef.current) {
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

          if (urlUsrn && (!streetContext.currentStreet || streetContext.currentStreet.usrn.toString() !== urlUsrn))
            streetContext.onUpdateCurrentStreet(Number(urlUsrn), "Add new Street", true);
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

    if (location.pathname.includes(StreetRoute)) SetUpStreetData(location.pathname.replace(`${StreetRoute}/`, ""));

    return () => {};
  }, [streetContext, sandboxContext, userContext, settingsContext, lookupContext, apiUrl, location]);

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
