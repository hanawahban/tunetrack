"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropdownMenu = DropdownMenu;
exports.DropdownMenuPortal = DropdownMenuPortal;
exports.DropdownMenuTrigger = DropdownMenuTrigger;
exports.DropdownMenuContent = DropdownMenuContent;
exports.DropdownMenuGroup = DropdownMenuGroup;
exports.DropdownMenuLabel = DropdownMenuLabel;
exports.DropdownMenuItem = DropdownMenuItem;
exports.DropdownMenuCheckboxItem = DropdownMenuCheckboxItem;
exports.DropdownMenuRadioGroup = DropdownMenuRadioGroup;
exports.DropdownMenuRadioItem = DropdownMenuRadioItem;
exports.DropdownMenuSeparator = DropdownMenuSeparator;
exports.DropdownMenuShortcut = DropdownMenuShortcut;
exports.DropdownMenuSub = DropdownMenuSub;
exports.DropdownMenuSubTrigger = DropdownMenuSubTrigger;
exports.DropdownMenuSubContent = DropdownMenuSubContent;
const React = require("react");
const radix_ui_1 = require("radix-ui");
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
function DropdownMenu({ ...props }) {
    return <radix_ui_1.DropdownMenu.Root data-slot="dropdown-menu" {...props}/>;
}
function DropdownMenuPortal({ ...props }) {
    return (<radix_ui_1.DropdownMenu.Portal data-slot="dropdown-menu-portal" {...props}/>);
}
function DropdownMenuTrigger({ ...props }) {
    return (<radix_ui_1.DropdownMenu.Trigger data-slot="dropdown-menu-trigger" {...props}/>);
}
function DropdownMenuContent({ className, align = "start", sideOffset = 4, ...props }) {
    return (<radix_ui_1.DropdownMenu.Portal>
      <radix_ui_1.DropdownMenu.Content data-slot="dropdown-menu-content" sideOffset={sideOffset} align={align} className={(0, utils_1.cn)("z-50 max-h-(--radix-dropdown-menu-content-available-height) w-(--radix-dropdown-menu-trigger-width) min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className)} {...props}/>
    </radix_ui_1.DropdownMenu.Portal>);
}
function DropdownMenuGroup({ ...props }) {
    return (<radix_ui_1.DropdownMenu.Group data-slot="dropdown-menu-group" {...props}/>);
}
function DropdownMenuItem({ className, inset, variant = "default", ...props }) {
    return (<radix_ui_1.DropdownMenu.Item data-slot="dropdown-menu-item" data-inset={inset} data-variant={variant} className={(0, utils_1.cn)("group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive", className)} {...props}/>);
}
function DropdownMenuCheckboxItem({ className, children, checked, inset, ...props }) {
    return (<radix_ui_1.DropdownMenu.CheckboxItem data-slot="dropdown-menu-checkbox-item" data-inset={inset} className={(0, utils_1.cn)("relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} checked={checked} {...props}>
      <span className="pointer-events-none absolute right-2 flex items-center justify-center" data-slot="dropdown-menu-checkbox-item-indicator">
        <radix_ui_1.DropdownMenu.ItemIndicator>
          <lucide_react_1.CheckIcon />
        </radix_ui_1.DropdownMenu.ItemIndicator>
      </span>
      {children}
    </radix_ui_1.DropdownMenu.CheckboxItem>);
}
function DropdownMenuRadioGroup({ ...props }) {
    return (<radix_ui_1.DropdownMenu.RadioGroup data-slot="dropdown-menu-radio-group" {...props}/>);
}
function DropdownMenuRadioItem({ className, children, inset, ...props }) {
    return (<radix_ui_1.DropdownMenu.RadioItem data-slot="dropdown-menu-radio-item" data-inset={inset} className={(0, utils_1.cn)("relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      <span className="pointer-events-none absolute right-2 flex items-center justify-center" data-slot="dropdown-menu-radio-item-indicator">
        <radix_ui_1.DropdownMenu.ItemIndicator>
          <lucide_react_1.CheckIcon />
        </radix_ui_1.DropdownMenu.ItemIndicator>
      </span>
      {children}
    </radix_ui_1.DropdownMenu.RadioItem>);
}
function DropdownMenuLabel({ className, inset, ...props }) {
    return (<radix_ui_1.DropdownMenu.Label data-slot="dropdown-menu-label" data-inset={inset} className={(0, utils_1.cn)("px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7", className)} {...props}/>);
}
function DropdownMenuSeparator({ className, ...props }) {
    return (<radix_ui_1.DropdownMenu.Separator data-slot="dropdown-menu-separator" className={(0, utils_1.cn)("-mx-1 my-1 h-px bg-border", className)} {...props}/>);
}
function DropdownMenuShortcut({ className, ...props }) {
    return (<span data-slot="dropdown-menu-shortcut" className={(0, utils_1.cn)("ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground", className)} {...props}/>);
}
function DropdownMenuSub({ ...props }) {
    return <radix_ui_1.DropdownMenu.Sub data-slot="dropdown-menu-sub" {...props}/>;
}
function DropdownMenuSubTrigger({ className, inset, children, ...props }) {
    return (<radix_ui_1.DropdownMenu.SubTrigger data-slot="dropdown-menu-sub-trigger" data-inset={inset} className={(0, utils_1.cn)("flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      {children}
      <lucide_react_1.ChevronRightIcon className="ml-auto"/>
    </radix_ui_1.DropdownMenu.SubTrigger>);
}
function DropdownMenuSubContent({ className, ...props }) {
    return (<radix_ui_1.DropdownMenu.SubContent data-slot="dropdown-menu-sub-content" className={(0, utils_1.cn)("z-50 min-w-[96px] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className)} {...props}/>);
}
//# sourceMappingURL=dropdown-menu.js.map