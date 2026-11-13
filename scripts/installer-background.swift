import AppKit

let width = 680
let height = 336
let image = NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height, bitsPerSample: 8,
    samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB,
    bytesPerRow: 0, bitsPerPixel: 0
)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: image)
NSColor.white.setFill()
NSRect(x: 0, y: 0, width: width, height: height).fill()

let caption = NSAttributedString(string: "将 LikeBird 拖到应用程序", attributes: [
    .font: NSFont.systemFont(ofSize: 14),
    .foregroundColor: NSColor(srgbRed: 0.36, green: 0.36, blue: 0.36, alpha: 1),
])
caption.draw(at: NSPoint(x: (CGFloat(width) - caption.size().width) / 2, y: 80))
NSGraphicsContext.restoreGraphicsState()

try image.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
