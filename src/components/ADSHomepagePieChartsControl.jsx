/* #region header */
/**************************************************************************************************
//
//  Description: Doughnut Charts array for Homepage
//
//  Copyright:    © 2023 Idox Software Limited
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   02.06.23 Joel Benford        WI40689 Initial Revision.
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   24.11.23 Sean Flook                 Moved Box to @mui/system and sorted out a warning.
//    004   22.03.24 Sean Flook           GLB12 Fix the height of the charts.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import { Grid, Card, CardContent } from "@mui/material";
import { Box } from "@mui/system";
import ADSDoughnutChart from "./ADSDoughnutChart";

import { adsMidGreyA30 } from "../utils/ADSColours";
import { doughnutHeight } from "../utils/ADSStyles";

function ADSHomepagePieChartsControl({ data }) {
  return (
    <Box>
      <Grid container direction="row" spacing={4} sx={{ pt: "8px" }}>
        {data.map((chart, index) => (
          <Grid item align="center" id={`grid-doughnut-${index}`} key={`grid-doughnut-${index}`}>
            <Card
              id={`card-doughnut-${index}`}
              key={`card-doughnut-${index}`}
              variant="outlined"
              sx={{ height: `${doughnutHeight}px`, width: "16vw", borderStyle: "solid", borderColor: adsMidGreyA30 }}
            >
              <CardContent>
                <ADSDoughnutChart
                  id={`doughnut-chart-${index}`}
                  key={`doughnut-chart-${index}`}
                  chartData={chart.slices}
                  title={chart.title}
                  label="label"
                  value="value"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ADSHomepagePieChartsControl;
