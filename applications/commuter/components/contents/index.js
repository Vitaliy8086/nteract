// @flow
import * as React from "react";

import NotebookPreview from "@nteract/notebook-preview";
import Markdown from "@nteract/markdown";
import { Styles } from "@nteract/presentational-components";

import DirectoryListing from "./directory-listing";

// HACK: Temporarily provide jquery for others to use...
const jquery = require("jquery");
global.jquery = jquery;
global.$ = jquery;

import {
  standardTransforms,
  standardDisplayOrder,
  registerTransform
} from "@nteract/transforms";

// import DataResourceTransform from "@nteract/transform-dataresource";

import { VegaLite1, VegaLite2, Vega2, Vega3 } from "@nteract/transform-vega";

import { PlotlyNullTransform, PlotlyTransform } from "../../transforms";

// Order is important here. The last transform in the array will have order `0`.
const { transforms, displayOrder } = [
  // DataResourceTransform,
  PlotlyNullTransform,
  PlotlyTransform,
  VegaLite1,
  VegaLite2,
  Vega2,
  Vega3
].reduce(registerTransform, {
  transforms: standardTransforms,
  displayOrder: standardDisplayOrder
});

import HTMLView from "./html";
import JSONView from "./json";
import CSVView from "./csv";

const suffixRegex = /(?:\.([^.]+))?$/;

class File extends React.Component<*> {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const name = this.props.entry.name;
    const suffix = (suffixRegex.exec(name)[1] || "").toLowerCase();

    switch (suffix) {
      case "html":
        return <HTMLView entry={this.props.entry} />;
      case "json":
        return <JSONView entry={this.props.entry} />;
      case "csv":
        return <CSVView entry={this.props.entry} />;
      case "md":
      case "markdown":
      case "rmd":
        return <Markdown source={this.props.entry.content} />;
      case "gif":
      case "jpeg":
      case "jpg":
      case "png":
        return (
          <img
            src={`/files/${this.props.pathname}`}
            alt={this.props.pathname}
          />
        );
      default:
        return <a href={`/files/${this.props.pathname}`}>Download raw file</a>;
    }
  }
}

type EntryProps = {
  entry: JupyterApi$Content,
  pathname: string,
  basepath: string
};

export const Entry = (props: EntryProps) => {
  if (props.entry.content === null) {
    return null;
  }

  switch (props.entry.type) {
    case "directory":
      // Dynamic type check on content being an Array
      if (Array.isArray(props.entry.content)) {
        return (
          <DirectoryListing contents={props.entry.content} basepath={"/view"} />
        );
      }
      return null;
    case "file":
      // TODO: Case off various file types (by extension, mimetype)
      return <File entry={props.entry} pathname={props.pathname} />;
    case "notebook":
      return (
        <Styles>
          <NotebookPreview
            notebook={props.entry.content}
            displayOrder={displayOrder}
            transforms={transforms}
          />
        </Styles>
      );
    default:
      return <pre>{JSON.stringify(props.entry.content)}</pre>;
  }
};
