"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Avatar = Avatar;
exports.AvatarImage = AvatarImage;
exports.AvatarFallback = AvatarFallback;
exports.AvatarGroup = AvatarGroup;
exports.AvatarGroupCount = AvatarGroupCount;
exports.AvatarBadge = AvatarBadge;
const React = require("react");
const radix_ui_1 = require("radix-ui");
const utils_1 = require("@/lib/utils");
function Avatar({ className, size = "default", ...props }) {
    return (<radix_ui_1.Avatar.Root data-slot="avatar" data-size={size} className={(0, utils_1.cn)("group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten", className)} {...props}/>);
}
function AvatarImage({ className, ...props }) {
    return (<radix_ui_1.Avatar.Image data-slot="avatar-image" className={(0, utils_1.cn)("aspect-square size-full rounded-full object-cover", className)} {...props}/>);
}
function AvatarFallback({ className, ...props }) {
    return (<radix_ui_1.Avatar.Fallback data-slot="avatar-fallback" className={(0, utils_1.cn)("flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs", className)} {...props}/>);
}
function AvatarBadge({ className, ...props }) {
    return (<span data-slot="avatar-badge" className={(0, utils_1.cn)("absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none", "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden", "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2", "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2", className)} {...props}/>);
}
function AvatarGroup({ className, ...props }) {
    return (<div data-slot="avatar-group" className={(0, utils_1.cn)("group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background", className)} {...props}/>);
}
function AvatarGroupCount({ className, ...props }) {
    return (<div data-slot="avatar-group-count" className={(0, utils_1.cn)("relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3", className)} {...props}/>);
}
//# sourceMappingURL=avatar.js.map