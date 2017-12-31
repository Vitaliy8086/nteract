/* @flow */

/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */

import * as React from "react";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";
import CodeMirror from "./editor";

import LatexRenderer from "../components/latex";
import { Display, RichestMime } from "@nteract/display-area";

import MarkdownPreviewer from "../components/markdown-preview";
import Toolbar from "./toolbar";

// TODO: This can be deleted once Toolbar and Editor are no longer connected
//       components. This is really only needed for tests, I'm hoping to tackle
//       this next.
const PropTypes = require("prop-types");

import { Input, Prompt, Editor, Pagers, Outputs, Cell } from "../components";

import { HijackScroll } from "../components/hijack-scroll";

export type CellProps = {
  cell: any,
  displayOrder: Array<string>,
  id: string,
  cellFocused: string,
  editorFocused: string,
  language: string,
  running: boolean,
  theme: string,
  pagers: ImmutableList<any>,
  transforms: Object,
  models: ImmutableMap<string, any>,
  selectCell: () => void,
  focusAboveCell: () => void,
  focusBelowCell: () => void,
  focusCellEditor: () => void
};

export default class CellView extends React.Component<CellProps, *> {
  static defaultProps = {
    pagers: new ImmutableList(),
    models: new ImmutableMap()
  };

  // TODO: This can be deleted once Toolbar and Editor are no longer connected components
  static contextTypes = {
    store: PropTypes.object
  };

  render() {
    const cell = this.props.cell;
    const cellType = cell.get("cell_type");
    const cellFocused = this.props.cellFocused === this.props.id;
    const editorFocused = this.props.editorFocused === this.props.id;

    let element = null;

    switch (cellType) {
      case "code":
        const sourceHidden =
          cell.getIn(["metadata", "inputHidden"], false) ||
          cell.getIn(["metadata", "hide_input"], false);

        const outputHidden =
          cell.get("outputs").size === 0 ||
          cell.getIn(["metadata", "outputHidden"]);
        const outputExpanded = cell.getIn(["metadata", "outputExpanded"]);

        element = (
          <div>
            <Input hidden={sourceHidden}>
              <Prompt
                counter={this.props.cell.get("execution_count")}
                running={this.props.running}
              />
              <Editor>
                <CodeMirror
                  tip
                  completion
                  id={this.props.id}
                  value={this.props.cell.get("source")}
                  language={this.props.language}
                  cellFocused={cellFocused}
                  editorFocused={editorFocused}
                  theme={this.props.theme}
                  focusAbove={this.props.focusAboveCell}
                  focusBelow={this.props.focusBelowCell}
                />
              </Editor>
            </Input>
            <Pagers>
              {this.props.pagers.map((pager, key) => (
                <RichestMime
                  expanded
                  className="pager"
                  displayOrder={this.props.displayOrder}
                  transforms={this.props.transforms}
                  bundle={pager}
                  theme={this.props.theme}
                  key={key}
                />
              ))}
            </Pagers>
            <LatexRenderer>
              <Outputs
                hidden={outputHidden}
                expanded={cell.getIn(["metadata", "outputExpanded"], true)}
              >
                <Display
                  className="outputs-display"
                  outputs={this.props.cell.get("outputs").toJS()}
                  displayOrder={this.props.displayOrder}
                  transforms={this.props.transforms}
                  theme={this.props.theme}
                  expanded={outputExpanded}
                  isHidden={outputHidden}
                  models={this.props.models.toJS()}
                />
              </Outputs>
            </LatexRenderer>
          </div>
        );

        break;
      case "markdown":
        element = (
          <MarkdownPreviewer
            focusAbove={this.props.focusAboveCell}
            focusBelow={this.props.focusBelowCell}
            focusEditor={this.props.focusCellEditor}
            cellFocused={cellFocused}
            editorFocused={editorFocused}
            source={cell.get("source", "")}
          >
            <Editor>
              <CodeMirror
                language="markdown"
                id={this.props.id}
                value={this.props.cell.get("source")}
                theme={this.props.theme}
                focusAbove={this.props.focusAboveCell}
                focusBelow={this.props.focusBelowCell}
                cellFocused={cellFocused}
                editorFocused={editorFocused}
                options={{
                  // Markdown should always be line wrapped
                  lineWrapping: true
                }}
              />
            </Editor>
          </MarkdownPreviewer>
        );
        break;

      default:
        element = <pre>{cell.get("source")}</pre>;
        break;
    }

    return (
      <HijackScroll focused={cellFocused} onClick={this.props.selectCell}>
        <Cell isSelected={cellFocused}>
          <Toolbar type={cellType} cell={cell} id={this.props.id} />
          {element}
          <style jsx>{`
            /*
           * Show the cell-toolbar-mask if hovering on cell,
           * or cell was the last clicked (has .focused class).
           */
            :global(.cell:hover .cell-toolbar-mask),
            :global(.cell.focused .cell-toolbar-mask) {
              display: block;
            }
          `}</style>
        </Cell>
      </HijackScroll>
    );
  }
}