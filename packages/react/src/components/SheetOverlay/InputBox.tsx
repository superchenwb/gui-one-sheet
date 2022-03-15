import { getCellValue } from "@fortune-sheet/core/src/modules/cell";
import { isInlineStringCell } from "@fortune-sheet/core/src/modules/inline-string";
import { moveToEnd } from "@fortune-sheet/core/src/modules/cursor";
import { escapeScriptTag } from "@fortune-sheet/core/src/utils";
import React, { useContext, useState, useEffect, useMemo, useRef } from "react";
import WorkbookContext from "../../context";
import { getInlineStringHTML, getStyleByCell } from "./util";
import ContentEditable from "./ContentEditable";

const InputBox: React.FC = () => {
  const { context, refs } = useContext(WorkbookContext);
  const inputRef = useRef<HTMLDivElement>(null);
  const [inputHTML, setInputHTML] = useState<string>("");

  refs.cellInputValue.current = inputRef.current?.innerHTML || "";

  const inputBoxStyle = useMemo(() => {
    if (context.luckysheet_select_save.length > 0 && context.cellUpdating) {
      return getStyleByCell(
        context.flowdata,
        context.luckysheet_select_save[0].row_focus,
        context.luckysheet_select_save[0].column_focus
      );
    }
    return {};
  }, [context.cellUpdating, context.flowdata, context.luckysheet_select_save]);

  useEffect(() => {
    if (context.luckysheet_select_save.length > 0 && context.cellUpdating) {
      const row_index = context.luckysheet_select_save[0].row_focus;
      const col_index = context.luckysheet_select_save[0].column_focus;
      const cell = context.flowdata?.[row_index]?.[col_index];
      if (!cell) {
        return;
      }
      let value = "";
      if (isInlineStringCell(cell)) {
        value = getInlineStringHTML(row_index, col_index, context.flowdata);
      } else if (cell.f) {
        value = getCellValue(row_index, col_index, context.flowdata, "f");
      } else {
        value =
          getCellValue(row_index, col_index, context.flowdata, "m") ||
          getCellValue(row_index, col_index, context.flowdata, "v");
        // if (Number(cell.qp) === "1") {
        //   value = value ? "" + value : value;
        // }
      }
      setInputHTML(escapeScriptTag(value));
      setTimeout(() => {
        moveToEnd(inputRef.current!);
      });
    }
  }, [context.cellUpdating, context.flowdata, context.luckysheet_select_save]);

  useEffect(() => {
    if (!context.cellUpdating) {
      setInputHTML("");
    }
  }, [context.cellUpdating]);

  if (!(context.luckysheet_select_save.length > 0 && context.cellUpdating)) {
    return null;
  }

  return (
    <div
      className="luckysheet-input-box"
      style={{
        left: context.luckysheet_select_save[0].left_move,
        width: context.luckysheet_select_save[0].width_move,
        top: context.luckysheet_select_save[0].top_move,
        height: context.luckysheet_select_save[0].height_move,
        ...inputBoxStyle,
      }}
    >
      <ContentEditable
        innerRef={inputRef}
        className="luckysheet-cell-input"
        id="luckysheet-rich-text-editor"
        aria-autocomplete="list"
        html={inputHTML}
        onChange={setInputHTML}
      />
    </div>
  );
};

export default InputBox;