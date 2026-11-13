"""Write the Finder layout on the mounted HFS+ volume."""

from pathlib import Path
import sys

from ds_store import DSStore
from mac_alias import Alias


def main(volume):
    background = Alias.for_file(str(volume / ".background.png"))
    background.volume.posix_path = None
    with DSStore.open(str(volume / ".DS_Store"), "w+") as layout:
        layout["."]["vSrn"] = ("long", 1)
        layout["."]["icvl"] = ("type", b"icnv")
        layout["."]["bwsp"] = {
            "WindowBounds": "{{110, 120}, {680, 364}}",
            "ShowSidebar": False,
            "ShowToolbar": False,
            "ShowStatusBar": False,
            "ShowTabView": False,
        }
        layout["."]["icvp"] = {
            "viewOptionsVersion": 1,
            "backgroundType": 2,
            "backgroundColorRed": 1.0,
            "backgroundColorGreen": 1.0,
            "backgroundColorBlue": 1.0,
            "backgroundImageAlias": background.to_bytes(),
            "arrangeBy": "none",
            "gridOffsetX": 0.0,
            "gridOffsetY": 0.0,
            "gridSpacing": 100.0,
            "iconSize": 96.0,
            "textSize": 14.0,
            "labelOnBottom": True,
            "showIconPreview": True,
            "showItemInfo": False,
            "scrollPositionX": 0.0,
            "scrollPositionY": 0.0,
        }
        layout["LikeBird.app"]["Iloc"] = (197, 118)
        layout["应用程序"]["Iloc"] = (483, 118)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
