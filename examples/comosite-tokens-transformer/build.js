const StyleDictionary = require("style-dictionary");

/* -------------------- */
/* PARSER UTILS ------- */
/* -------------------- */

const removeDollarSign = (obj) => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeDollarSign);
  }
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      let newKey = key;
      if (
        key.startsWith("$") &&
        ["value", "type", "description", "extensions"].includes(key.slice(1))
      ) {
        newKey = key.slice(1);
      }
      result[newKey] = removeDollarSign(obj[key]);
    }
  }
  return result;
};

/* -------------------- */
/* CUSTOM PARSER ------ */
/* -------------------- */

const BrueckeParser = {
  name: "parser/tokensBruecke",
  pattern: /\.json$|\.tokens\.json$|\.tokens$/,
  parse: ({ contents }) => {
    /* Remove $meta data from the JSON
    /* in order to avoid collision errors */
    const json = JSON.parse(contents);
    delete json.$meta;

    /* Remove $ sign from property names
    /* if they are in DTCG format */
    return removeDollarSign(json);
  }
};

/* -------------------- */
/* CUSTOM TRANSFORMER - */
/* -------------------- */

StyleDictionary.registerTransform({
  name: "tokensBruecke/shadow-css",
  type: "value",
  matcher: ({ type }) => {
    return ["shadow"].includes(type);
  },
  transformer: ({ value }) =>
    `${value.offsetX || 0} ${value.offsetY || 0} ${value.blur || 0} ${
      value.spread || 0
    } ${value.color}`
});

/* -------------------- */
/* CONFIGURATIONS ----- */
/* -------------------- */

console.log("Build started...");
console.log("\n==============================================");

/* Register the custom parser */
StyleDictionary.registerParser(BrueckeParser);

/* Register the custom transformer */
StyleDictionary.registerTransformGroup({
  name: "tokensBruecke/shadow-css",
  transforms: ["tokensBruecke/shadow-css", "attribute/cti", "name/cti/kebab"]
});

/* Extend the Style Dictionary configuration */
const StyleDictionaryExtended = StyleDictionary.extend({
  source: ["tokens/**/*.json"],
  platforms: {
    css: {
      transformGroup: "custom/css",
      buildPath: "build/",
      files: [
        {
          destination: "_variables.css",
          format: "css/variables"
        }
      ]
    },
    scss: {
      transformGroup: "scss",
      buildPath: "build/",
      files: [
        {
          destination: "_variables.scss",
          format: "scss/variables"
        }
      ]
    }
  }
});

/* Build all platforms */
StyleDictionaryExtended.buildAllPlatforms();

console.log("\n==============================================");
console.log("\nBuild completed!");