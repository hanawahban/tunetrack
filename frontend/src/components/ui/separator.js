"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Separator = Separator;
const React = require("react");
const radix_ui_1 = require("radix-ui");
const utils_1 = require("@/lib/utils");
function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
    return (<radix_ui_1.Separator.Root data-slot="separator" decorative={decorative} orientation={orientation} className={(0, utils_1.cn)("shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch", className)} {...props}/>);
}
//# sourceMappingURL=separator.js.map