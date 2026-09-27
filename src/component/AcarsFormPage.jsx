import { AOC, ATS } from "../common/AcarsMenus.mjs";
import AcarsService from "../common/AcarsService.mjs";
import { cloneObjectSafe } from "../common/utils.mjs";
import UplinkArrow from "./Arrow";

const createValueMap = (key, fields) => {
  if (AcarsService.formCacheEntry(key)) return AcarsService.formCacheEntry(key);
  const map = {};
  for (const page of fields) {
    for (const row of page) {
      for (const field of [row.left, row.right].filter(
        (e) => e !== undefined,
      )) {
        map[field.key] =
          typeof field.defaultValue === "function" ? field.defaultValue() : "";
      }
    }
  }
  return map;
};
const isValid = (fields, values, noConnection, alwaysValid) => {
  if (alwaysValid)
    return true;
  if (!AcarsService._client && noConnection !== true) return false;
  for (const page of fields) {
    for (const row of page) {
      for (const field of [row.left, row.right].filter(
        (e) => e !== undefined,
      )) {
        if (
          field.regex &&
          (values[field.key] || "").match(field.regex) === null
        )
          return false;
      }
    }
  }

  return true;
};
const keyMap = {};
const AcarsFormPage = ({ arg, onSubmit, latest, onLatest }) => {
  const { useState, useEffect } = reactUtils;
  const { Button, OffsetBox } = ui;
  const { fields, title, key: formKey, send: sendText, noConnection, parent, alwaysValid } = arg;
  const [activePage, setActivePage] = useState(0);
  const [fieldValues, setFieldValues] = reactUtils.useState(
    createValueMap(formKey, fields),
  );
  const [valid, setValid] = useState(isValid(fields, fieldValues, noConnection, alwaysValid));
  useEffect(() => {
    if (arg.asyncFetch)
      arg.asyncFetch(setFieldValues);
      
  }, [arg, setFieldValues]);
  const btnPressed = (s, r) => {
    if (s === "l" && r === 5) {
      onSubmit("menu", parent === "AOC" ? AOC : ATS);
    }
    if (s === "r" && r === 5) {
      if (latest) {
        onLatest();
      }
      return;
    }
    if (s === "r" && r === 4) {
      if (valid) onSubmit("formSubmit", fieldValues, setFieldValues);
      return;
    }
    const entry = keyMap[`${s}-${r}`];
    if (entry) {
      if (entry.options) {
        const current = fieldValues[entry.key];
        const opt = entry.options.find((e) => e.value === current);
        const next = entry.options.indexOf(opt) + 1;
        const rotated = next === entry.options.length ? 0 : next;
        const cl = cloneObjectSafe(fieldValues);
        cl[entry.key] = entry.options[rotated].value;
        setValid(isValid(fields, cl, noConnection, alwaysValid));
        setFieldValues(cl);
        AcarsService.setFormCache(formKey, cl);
        return;
      }
      const text = reactUtils.scratchPad.getState().text;
      if (typeof text === "string" && text.length) {
        const valid = entry.regex ? text.match(entry.regex) !== null : true;
        if (valid) {
          const cl = cloneObjectSafe(fieldValues);
          cl[entry.key] = entry.alter ? entry.alter(text) : text;
          setValid(isValid(fields, cl, noConnection, alwaysValid));
          setFieldValues(cl);
          AcarsService.setFormCache(formKey, cl);
        }
        reactUtils.clearScratchPad();
      } else if (text === null) {
        const cl = cloneObjectSafe(fieldValues);
        cl[entry.key] = "";
        setValid(isValid(fields, cl, noConnection, alwaysValid));
        setFieldValues(cl);
        AcarsService.setFormCache(formKey, cl);
        reactUtils.clearScratchPad();
      }
    }
  };

  const renderField = (field, y, right, idx) => {
    const xOffset = 350;
    const charWidth = 8;
    if (field.type === "select") {
      keyMap[`${right ? "r" : "l"}-${idx}`] = {
        key: field.key,
        options: field.options,
      };
      const opt = field.options.find((e) => e.value === fieldValues[field.key]);

      return (
        <>
          <text
            className="LabelText White"
            y={0}
            x={right ? xOffset - field.title.length * charWidth : 0}
          >
            {field.title}
          </text>
          <UplinkArrow y={10} x={0} up={false} color={reactUtils.colors.LightBlue} />
          <text
            className="ContentText LightBlue"
            y={30}
            x={right ? (xOffset - 16 - (opt ? opt.label.length : 0) * charWidth) : 16}
          >
            {opt ? opt.label : ""}
          </text>
        </>
      );
    } else if (field.type === "freetext") {
      return (
        <>
          <text className="ContentText White" x={0} y={0}>
            {field.title}
          </text>

          {Array(Math.min(field.rows, 4))
            .fill()
            .map((_, i) => {
              keyMap[`${right ? "r" : "l"}-${1 + idx + i}`] = {
                key: `${field.key}${i}`,
              };
              const content = fieldValues[`${field.key}${i}`];
              if (content && content.length) {
                return (
                  <text
                    key={i}
                    className="ContentText White"
                    x={0}
                    y={120 + i * 100}
                  >
                    {content}
                  </text>
                );
              }
              return (
                <OffsetBox key={i} x={0} y={120 + i * 100}>
                  <text className="ContentText White" x={0} y={0}>
                    {"\u25AF".repeat(26)}
                  </text>
                </OffsetBox>
              );
            })}
        </>
      );
    }
    const v = fieldValues[field.key];
    const value = v && v.length > 0 ? v : "\u25AF".repeat(field.size);
    keyMap[`${right ? "r" : "l"}-${idx}`] = {
      key: field.key,
      regex: field.regex,
      alter: field.alter,
    };
    const isFieldValid = field.regex
      ? value.match(field.regex) !== null
      : v && v.length > 0;
    return (
      <>
        <text
          className="LabelText White"
          y={0}
          x={right ? xOffset - field.title.length * charWidth : 0}
        >
          {field.title}
        </text>
        <text
          className={`ContentText ${isFieldValid ? "Lime" : "White"}`}
          y={30}
          x={right ? xOffset - value.length * charWidth : 0}
        >
          {value}
        </text>
      </>
    );
  };
  return (
    <>
      <Button
        x={500}
        y={200}
        width={70}
        disabled={fields.length === 1}
        onClick={() => {
          if (activePage > 0) setActivePage(activePage - 1);
        }}
      >
        PREV
      </Button>
      <Button
        x={575}
        y={200}
        width={75}
        disabled={fields.length === 1}
        onClick={() => {
          if (activePage < fields.length - 1) setActivePage(activePage + 1);
        }}
      >
        NEXT
      </Button>
      {Array(6)
        .fill()
        .map((_, i) => {
          return (
            <Button
              key={i}
              x={80}
              y={335 + i * 100}
              width={90}
              onClick={() => {
                btnPressed("l", i);
              }}
            >
              {" "}
            </Button>
          );
        })}
      {Array(6)
        .fill()
        .map((_, i) => {
          return (
            <Button
              key={i}
              x={610}
              y={335 + i * 100}
              width={90}
              onClick={() => {
                btnPressed("r", i);
              }}
            >
              {" "}
            </Button>
          );
        })}
      <text className="ContentText White" x={240} y={290}>
        {parent === "AOC" ? "AOC" : "ATS"}
      </text>
      <text className="ContentText White" x={290} y={290}>
        -{title}
      </text>
      <text className="ContentText White" x={520} y={290}>
        {activePage + 1}/{fields.length}
      </text>

      <text className="ContentText White" x={210} y={855}>{`<RETURN`}</text>
      {latest ? (
        <text
          className="ContentText LightBlue"
          x={520 - (AcarsService.aocMessageStr(latest)).length * 7.6}
          y={855}
        >{`${AcarsService.aocMessageStr(latest)}*`}</text>
      ) : null}
      <text className="ContentText White" x={sendText ? 540 - ((sendText.length +1) * 9) : 530} y={765}>
        {`${sendText || "SEND"}${valid ? "*" : ""}`}
      </text>
      {fields[activePage].map((row, i) => {
        return (
          <OffsetBox x={200} y={355 + i * 100} key={i}>
            {row.left ? renderField(row.left, 0, false, i) : null}
            {row.right ? renderField(row.right, 0, true, i) : null}
          </OffsetBox>
        );
      })}
    </>
  );
};
export default AcarsFormPage;
