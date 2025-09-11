import { JSDOM } from "jsdom";
import table from "text-table";

export function processHTML(listListHTML, format) {
  const jsonList = HTMLToJSON(listListHTML);

  if (format === "json") {
    return JSON.stringify(jsonList, null, 2);
  } else {
    return JSONToText(jsonList);
  }
}

function JSONToText(jsonList) {
  const headers = ["index", "species", "FO date", "FO region", "FO location"];
  var t = jsonList.map((row) => [
    row.index,
    row.species,
    row.firstObservation.date,
    row.firstObservation.region,
    row.firstObservation.location,
  ]);

  return table([headers, ...t], { align: ["l", "l", "l", "l", "l"] });
}

function HTMLToJSON(listListHTML) {
  let observations = Array.from(
    JSDOM.fragment(listListHTML).querySelectorAll(
      "#nativeNatProv .Observation--sightingsList"
    )
  );

  return observations.reverse().map((node, index) => {
    return {
      index: index + 1,
      species: node
        .querySelector(".Observation-species .Heading")
        .textContent.trim(),
      speciesLink: node.querySelector(".Observation-species .Heading a").href,
      firstObservation: {
        date: node.querySelector(".Observation-meta-date a").textContent.trim(),
        checklistLink: node.querySelector(".Observation-meta-date a").href,
        location: node
          .querySelector(".Observation-meta-location a")
          .textContent.trim(),
        locationLink: node.querySelector(".Observation-meta-location a").href,
        region: node
          .querySelector(".Observation-meta-location a:nth-of-type(2)")
          .textContent.trim(),
        regionLink: node.querySelector(
          ".Observation-meta-location a:nth-of-type(2)"
        ).href,
      },
    };
  });
}
