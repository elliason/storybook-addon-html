import React, { useMemo, useEffect } from "react";
import { useAddonState, useChannel, useParameter } from "@storybook/api";
import { AddonPanel } from "@storybook/components";
import { ADDON_ID, EVENTS, PARAM_KEY } from "./constants";
import { PanelContent } from "./components/PanelContent";
import { format as prettierFormat } from "prettier/standalone";
import prettierHtml from "prettier/parser-html";

export const Panel = (props) => {
  // https://storybook.js.org/docs/react/addons/addons-api#useaddonstate
  const [{ code }, setState] = useAddonState(ADDON_ID, {
    code: null,
    options: {},
  }); // https://storybook.js.org/docs/react/addons/addons-api#usechannel

  useChannel({
    [EVENTS.CODE_UPDATE]: ({ code }) =>
      setState((state) => ({ ...state, code })),
  });

  const parameters = useParameter(PARAM_KEY, {});
  const {
    highlighter: { showLineNumbers = false, wrapLines = true } = {},
    prettier = {},
  } = parameters;

  const prettierConfig = {
    htmlWhitespaceSensitivity: "ignore",
    ...prettier,
    // Ensure we always pick the html parser
    parser: "html",
    plugins: [prettierHtml],
  };

  const formattedCode = useMemo(
    () => code && prettierFormat(code, prettierConfig),
    [code, prettierConfig],
  );

  /**
   * Media Factory custom code
   * post message to iframe to trigger the JS Handler in VF storybook
   */
  useEffect(() => {
    if (!formattedCode) {
      return;
    }

    const storyIframe = document.getElementById("storybook-preview-iframe");

    storyIframe.contentWindow.postMessage("html-plugin-code-received", "*");
  }, [formattedCode]);

  return (
    <AddonPanel {...props}>
      <PanelContent
        code={formattedCode}
        showLineNumbers={showLineNumbers}
        wrapLines={wrapLines}
      />
    </AddonPanel>
  );
};
