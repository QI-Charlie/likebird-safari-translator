#import <Cocoa/Cocoa.h>
#import <SafariServices/SafariServices.h>

static NSColor *YLColor(NSUInteger hex, CGFloat alpha) {
    return [NSColor colorWithSRGBRed:((hex >> 16) & 0xFF) / 255.0
                               green:((hex >> 8) & 0xFF) / 255.0
                                blue:(hex & 0xFF) / 255.0
                               alpha:alpha];
}

static NSTextField *YLLabel(NSString *text, CGFloat size, NSColor *color, BOOL bold) {
    NSTextField *label = [NSTextField labelWithString:text];
    label.font = bold ? [NSFont systemFontOfSize:size weight:NSFontWeightSemibold]
                      : [NSFont systemFontOfSize:size];
    label.textColor = color;
    label.selectable = NO;
    label.lineBreakMode = NSLineBreakByWordWrapping;
    label.maximumNumberOfLines = 0;
    return label;
}

static NSView *YLNumberBadge(NSString *number) {
    NSView *badge = [[NSView alloc] initWithFrame:NSMakeRect(0, 0, 26, 26)];
    badge.translatesAutoresizingMaskIntoConstraints = NO;
    badge.wantsLayer = YES;
    badge.layer.backgroundColor = YLColor(0xFFFFFF, 1).CGColor;
    badge.layer.cornerRadius = 8;
    badge.layer.borderWidth = 1;
    badge.layer.borderColor = YLColor(0xE2DED4, 1).CGColor;
    NSTextField *label = YLLabel(number, 11, YLColor(0x111111, 1), YES);
    label.alignment = NSTextAlignmentCenter;
    label.translatesAutoresizingMaskIntoConstraints = NO;
    [badge addSubview:label];
    [NSLayoutConstraint activateConstraints:@[
        [badge.widthAnchor constraintEqualToConstant:26],
        [badge.heightAnchor constraintEqualToConstant:26],
        [label.centerXAnchor constraintEqualToAnchor:badge.centerXAnchor],
        [label.centerYAnchor constraintEqualToAnchor:badge.centerYAnchor],
    ]];
    return badge;
}

static NSView *YLStepRow(NSString *number, NSString *title, NSString *detail) {
    NSView *row = [[NSView alloc] initWithFrame:NSZeroRect];
    row.translatesAutoresizingMaskIntoConstraints = NO;
    NSView *badge = YLNumberBadge(number);
    NSStackView *copy = [NSStackView stackViewWithViews:@[
        YLLabel(title, 13, YLColor(0x111111, 1), YES),
        YLLabel(detail, 11, YLColor(0x6F6B63, 1), NO),
    ]];
    copy.orientation = NSUserInterfaceLayoutOrientationVertical;
    copy.alignment = NSLayoutAttributeLeading;
    copy.spacing = 2;
    copy.translatesAutoresizingMaskIntoConstraints = NO;
    [row addSubview:badge];
    [row addSubview:copy];
    [NSLayoutConstraint activateConstraints:@[
        [badge.leadingAnchor constraintEqualToAnchor:row.leadingAnchor],
        [badge.topAnchor constraintEqualToAnchor:row.topAnchor constant:1],
        [copy.leadingAnchor constraintEqualToAnchor:badge.trailingAnchor constant:11],
        [copy.trailingAnchor constraintEqualToAnchor:row.trailingAnchor],
        [copy.topAnchor constraintEqualToAnchor:row.topAnchor],
        [copy.bottomAnchor constraintEqualToAnchor:row.bottomAnchor],
        [row.heightAnchor constraintGreaterThanOrEqualToConstant:38],
    ]];
    return row;
}

@interface YLAppDelegate : NSObject <NSApplicationDelegate>
@property (strong) NSWindow *window;
@end

@implementation YLAppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)notification {
    [NSApp setActivationPolicy:NSApplicationActivationPolicyRegular];
    [self buildMenu];
    [self buildWindow];
    [self.window makeKeyAndOrderFront:nil];
    [NSApp activateIgnoringOtherApps:YES];

    NSString *snapshotPath = NSProcessInfo.processInfo.environment[@"YILIU_SNAPSHOT"];
    if (snapshotPath.length) {
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            NSView *view = self.window.contentView;
            NSBitmapImageRep *rep = [view bitmapImageRepForCachingDisplayInRect:view.bounds];
            [view cacheDisplayInRect:view.bounds toBitmapImageRep:rep];
            NSData *png = [rep representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
            [png writeToFile:snapshotPath atomically:YES];
            [NSApp terminate:nil];
        });
    }
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
    return YES;
}

- (void)buildMenu {
    NSMenu *mainMenu = [[NSMenu alloc] initWithTitle:@"译流"];
    NSMenuItem *appItem = [[NSMenuItem alloc] initWithTitle:@"译流" action:nil keyEquivalent:@""];
    [mainMenu addItem:appItem];

    NSMenu *appMenu = [[NSMenu alloc] initWithTitle:@"译流"];
    [appMenu addItemWithTitle:@"关于译流" action:@selector(orderFrontStandardAboutPanel:) keyEquivalent:@""];
    [appMenu addItem:[NSMenuItem separatorItem]];
    [appMenu addItemWithTitle:@"隐藏译流" action:@selector(hide:) keyEquivalent:@"h"];
    [appMenu addItemWithTitle:@"退出译流" action:@selector(terminate:) keyEquivalent:@"q"];
    appItem.submenu = appMenu;

    NSMenuItem *editItem = [[NSMenuItem alloc] initWithTitle:@"编辑" action:nil keyEquivalent:@""];
    NSMenu *editMenu = [[NSMenu alloc] initWithTitle:@"编辑"];
    [editMenu addItemWithTitle:@"复制" action:@selector(copy:) keyEquivalent:@"c"];
    [editMenu addItemWithTitle:@"全选" action:@selector(selectAll:) keyEquivalent:@"a"];
    editItem.submenu = editMenu;
    [mainMenu addItem:editItem];

    NSApp.mainMenu = mainMenu;
}

- (NSView *)noteBoxWithText:(NSString *)text {
    NSView *box = [[NSView alloc] initWithFrame:NSZeroRect];
    box.translatesAutoresizingMaskIntoConstraints = NO;
    box.wantsLayer = YES;
    box.layer.backgroundColor = YLColor(0xFFFFFF, 1).CGColor;
    box.layer.cornerRadius = 10;
    box.layer.borderWidth = 1;
    box.layer.borderColor = YLColor(0xE2DED4, 1).CGColor;

    NSTextField *label = YLLabel(text, 10.5, YLColor(0x111111, 1), NO);
    label.translatesAutoresizingMaskIntoConstraints = NO;
    [box addSubview:label];
    [NSLayoutConstraint activateConstraints:@[
        [label.leadingAnchor constraintEqualToAnchor:box.leadingAnchor constant:12],
        [label.trailingAnchor constraintEqualToAnchor:box.trailingAnchor constant:-12],
        [label.topAnchor constraintEqualToAnchor:box.topAnchor constant:10],
        [label.bottomAnchor constraintEqualToAnchor:box.bottomAnchor constant:-10],
    ]];
    return box;
}

- (void)buildWindow {
    NSRect frame = NSMakeRect(0, 0, 720, 540);
    self.window = [[NSWindow alloc] initWithContentRect:frame
                                             styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskClosable |
                                                       NSWindowStyleMaskMiniaturizable
                                               backing:NSBackingStoreBuffered
                                                 defer:NO];
    self.window.title = @"译流";
    self.window.minSize = NSMakeSize(620, 500);
    self.window.backgroundColor = YLColor(0xF7F4EC, 1);
    [self.window center];

    NSView *content = self.window.contentView;
    content.wantsLayer = YES;
    content.layer.backgroundColor = YLColor(0xF7F4EC, 1).CGColor;

    NSImageView *icon = [[NSImageView alloc] initWithFrame:NSZeroRect];
    NSString *iconPath = [[NSBundle mainBundle] pathForResource:@"AppIcon" ofType:@"icns"];
    icon.image = iconPath ? [[NSImage alloc] initWithContentsOfFile:iconPath] : [NSImage imageNamed:NSImageNameApplicationIcon];
    icon.imageScaling = NSImageScaleProportionallyUpOrDown;
    icon.translatesAutoresizingMaskIntoConstraints = NO;
    [icon.widthAnchor constraintEqualToConstant:58].active = YES;
    [icon.heightAnchor constraintEqualToConstant:58].active = YES;

    NSStackView *titleStack = [NSStackView stackViewWithViews:@[
        YLLabel(@"译流", 30, YLColor(0x111111, 1), YES),
        YLLabel(@"让每一页，都读得懂", 13, YLColor(0x6F6B63, 1), NO),
        YLLabel(@"Safari 整页翻译 · 划词翻译", 10.5, YLColor(0x7C776D, 1), NO),
    ]];
    titleStack.orientation = NSUserInterfaceLayoutOrientationVertical;
    titleStack.alignment = NSLayoutAttributeLeading;
    titleStack.spacing = 2;

    NSStackView *header = [NSStackView stackViewWithViews:@[icon, titleStack]];
    header.orientation = NSUserInterfaceLayoutOrientationHorizontal;
    header.alignment = NSLayoutAttributeCenterY;
    header.spacing = 16;

    NSBox *divider = [[NSBox alloc] initWithFrame:NSZeroRect];
    divider.boxType = NSBoxSeparator;
    divider.translatesAutoresizingMaskIntoConstraints = NO;
    [divider.heightAnchor constraintEqualToConstant:1].active = YES;

    NSStackView *steps = [NSStackView stackViewWithViews:@[
        YLStepRow(@"1", @"启用扩展", @"在 Safari 设置 → 扩展中勾选「译流」。"),
        YLStepRow(@"2", @"配置模型", @"填入任意 OpenAI 兼容 API 的地址、Key 与模型名。"),
        YLStepRow(@"3", @"开始阅读", @"点击工具栏「译」或按 ⌥A 翻译整页；选中文字即可划词翻译。"),
    ]];
    steps.orientation = NSUserInterfaceLayoutOrientationVertical;
    steps.alignment = NSLayoutAttributeLeading;
    steps.spacing = 13;

    NSView *note = [self noteBoxWithText:
        @"本地开发版未经过 Apple 签名。如果扩展没有出现在 Safari 的扩展列表中，请先在 Safari 设置 → 高级中勾选「显示网页开发者功能」，再到「开发」菜单勾选「允许未签名的扩展」。每次重启 Safari 后需要重新勾选。"];

    NSButton *openButton = [NSButton buttonWithTitle:@"打开 Safari 扩展设置" target:self action:@selector(openPreferences:)];
    openButton.bezelStyle = NSBezelStyleRegularSquare;
    openButton.bordered = NO;
    openButton.keyEquivalent = @"\r";
    openButton.contentTintColor = YLColor(0xF7F4EC, 1);
    openButton.cell.backgroundStyle = NSBackgroundStyleDark;
    openButton.attributedTitle = [[NSAttributedString alloc] initWithString:@"打开 Safari 扩展设置"
        attributes:@{
            NSForegroundColorAttributeName: YLColor(0xF7F4EC, 1),
            NSFontAttributeName: [NSFont systemFontOfSize:12 weight:NSFontWeightSemibold],
        }];
    openButton.wantsLayer = YES;
    openButton.layer.backgroundColor = YLColor(0x111111, 1).CGColor;
    openButton.layer.cornerRadius = 8;
    openButton.layer.borderWidth = 0;
    openButton.translatesAutoresizingMaskIntoConstraints = NO;
    [openButton.widthAnchor constraintEqualToConstant:190].active = YES;
    [openButton.heightAnchor constraintEqualToConstant:36].active = YES;

    NSButton *copyButton = [NSButton buttonWithTitle:@"复制安装步骤" target:self action:@selector(copySteps:)];
    copyButton.bezelStyle = NSBezelStyleRegularSquare;
    copyButton.bordered = NO;
    copyButton.wantsLayer = YES;
    copyButton.layer.backgroundColor = YLColor(0xFFFFFF, 1).CGColor;
    copyButton.layer.borderWidth = 1;
    copyButton.layer.borderColor = YLColor(0xE2DED4, 1).CGColor;
    copyButton.layer.cornerRadius = 8;
    copyButton.attributedTitle = [[NSAttributedString alloc] initWithString:@"复制安装步骤"
        attributes:@{
            NSForegroundColorAttributeName: YLColor(0x111111, 1),
            NSFontAttributeName: [NSFont systemFontOfSize:12 weight:NSFontWeightMedium],
        }];
    copyButton.translatesAutoresizingMaskIntoConstraints = NO;
    [copyButton.widthAnchor constraintEqualToConstant:128].active = YES;
    [copyButton.heightAnchor constraintEqualToConstant:36].active = YES;

    NSButton *quitButton = [NSButton buttonWithTitle:@"退出" target:NSApp action:@selector(terminate:)];
    quitButton.bezelStyle = NSBezelStyleRegularSquare;
    quitButton.bordered = NO;
    quitButton.wantsLayer = YES;
    quitButton.layer.backgroundColor = YLColor(0xFFFFFF, 1).CGColor;
    quitButton.layer.borderWidth = 1;
    quitButton.layer.borderColor = YLColor(0xE2DED4, 1).CGColor;
    quitButton.layer.cornerRadius = 8;
    quitButton.attributedTitle = [[NSAttributedString alloc] initWithString:@"退出"
        attributes:@{
            NSForegroundColorAttributeName: YLColor(0x111111, 1),
            NSFontAttributeName: [NSFont systemFontOfSize:12 weight:NSFontWeightMedium],
        }];
    quitButton.translatesAutoresizingMaskIntoConstraints = NO;
    [quitButton.widthAnchor constraintEqualToConstant:72].active = YES;
    [quitButton.heightAnchor constraintEqualToConstant:36].active = YES;

    NSStackView *buttons = [NSStackView stackViewWithViews:@[openButton, copyButton, quitButton]];
    buttons.orientation = NSUserInterfaceLayoutOrientationHorizontal;
    buttons.alignment = NSLayoutAttributeCenterY;
    buttons.spacing = 9;

    NSStackView *stack = [NSStackView stackViewWithViews:@[header, divider, steps, note, buttons]];
    stack.orientation = NSUserInterfaceLayoutOrientationVertical;
    stack.alignment = NSLayoutAttributeLeading;
    stack.spacing = 16;
    stack.translatesAutoresizingMaskIntoConstraints = NO;
    [content addSubview:stack];

    NSTextField *footer = YLLabel(
        @"译流 YiLiu  ·  数据仅发往你配置的 API  ·  com.yiliu.translator.extension",
        9,
        YLColor(0x7C776D, 1),
        NO);
    footer.alignment = NSTextAlignmentCenter;
    footer.translatesAutoresizingMaskIntoConstraints = NO;
    [content addSubview:footer];

    [NSLayoutConstraint activateConstraints:@[
        [steps.widthAnchor constraintEqualToAnchor:stack.widthAnchor],
        [divider.widthAnchor constraintEqualToAnchor:stack.widthAnchor],
        [note.widthAnchor constraintEqualToAnchor:stack.widthAnchor],
        [stack.leadingAnchor constraintEqualToAnchor:content.leadingAnchor constant:38],
        [stack.trailingAnchor constraintEqualToAnchor:content.trailingAnchor constant:-38],
        [stack.topAnchor constraintEqualToAnchor:content.topAnchor constant:34],
        [footer.leadingAnchor constraintEqualToAnchor:content.leadingAnchor constant:30],
        [footer.trailingAnchor constraintEqualToAnchor:content.trailingAnchor constant:-30],
        [footer.topAnchor constraintGreaterThanOrEqualToAnchor:stack.bottomAnchor constant:18],
        [footer.bottomAnchor constraintEqualToAnchor:content.bottomAnchor constant:-16],
    ]];
}

- (void)openPreferences:(id)sender {
    NSString *identifier = @"com.yiliu.translator.extension";
    [SFSafariApplication showPreferencesForExtensionWithIdentifier:identifier
                                               completionHandler:^(NSError *error) {
        if (!error) return;
        dispatch_async(dispatch_get_main_queue(), ^{
            NSURL *fallback = [NSURL URLWithString:@"x-apple.systempreferences:com.apple.Safari.Extensions"];
            [[NSWorkspace sharedWorkspace] openURL:fallback];
            NSAlert *alert = [[NSAlert alloc] init];
            alert.messageText = @"没有找到已注册的译流扩展";
            alert.informativeText = @"请确认 YiLiu.app 已拖入「应用程序」文件夹并至少打开一次，然后在 Safari 设置 → 扩展中手动启用。";
            [alert runModal];
        });
    }];
}

- (void)copySteps:(id)sender {
    NSString *steps =
        @"译流 Safari 扩展安装步骤\n"
         "1. 将 YiLiu.app 放入「应用程序」文件夹并打开。\n"
         "2. Safari 设置 → 扩展，勾选「译流」。\n"
         "3. 若看不到扩展：Safari 设置 → 高级，勾选「显示网页开发者功能」，再到「开发」菜单勾选「允许未签名的扩展」。\n"
         "4. 在扩展设置中填入 API 地址、Key 和模型，点击「测试连接」。\n"
         "5. 打开网页，点击工具栏「译」或按 ⌥A 翻译整页；选中文字后点击浮出的「译」划词翻译。\n";
    NSPasteboard *pasteboard = [NSPasteboard generalPasteboard];
    [pasteboard clearContents];
    [pasteboard setString:steps forType:NSPasteboardTypeString];
    NSAlert *alert = [[NSAlert alloc] init];
    alert.messageText = @"安装步骤已复制";
    alert.informativeText = @"可以粘贴到备忘录或发给朋友。";
    [alert runModal];
}

@end

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        NSApplication *application = [NSApplication sharedApplication];
        YLAppDelegate *delegate = [[YLAppDelegate alloc] init];
        application.delegate = delegate;
        [application setActivationPolicy:NSApplicationActivationPolicyRegular];
        [application run];
    }
    return 0;
}
