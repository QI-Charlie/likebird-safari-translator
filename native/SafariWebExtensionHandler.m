#import <Foundation/Foundation.h>
#import <SafariServices/SafariServices.h>

/// Safari loads this class as the web extension's native bridge. The extension
/// itself performs all network requests from its background page, so the bridge
/// only needs to acknowledge native messages and stay out of the way.
@interface SafariWebExtensionHandler : NSObject <NSExtensionRequestHandling>
@end

@implementation SafariWebExtensionHandler

- (void)beginRequestWithExtensionContext:(NSExtensionContext *)context {
    NSDictionary *payload = @{ @"ok": @YES, @"app": @"yiliu" };
    if (@available(macOS 14.0, *)) {
        NSExtensionItem *request = context.inputItems.firstObject;
        NSDictionary *message = request.userInfo[SFExtensionMessageKey];
        if ([message isKindOfClass:[NSDictionary class]]) {
            payload = @{ @"ok": @YES, @"app": @"yiliu", @"echo": message };
        }
    }

    NSExtensionItem *response = [[NSExtensionItem alloc] init];
    if (@available(macOS 14.0, *)) {
        response.userInfo = @{ SFExtensionMessageKey: payload };
    }
    [context completeRequestReturningItems:@[ response ] completionHandler:nil];
}

@end
