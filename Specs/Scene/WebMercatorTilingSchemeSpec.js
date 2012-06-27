/*global defineSuite*/
defineSuite([
         'Scene/WebMercatorTilingScheme',
         'Core/Extent',
         'Core/Math'
     ], function(
         WebMercatorTilingScheme,
         Extent,
         CesiumMath) {
    "use strict";
    /*global document,describe,it,expect*/

    describe('Conversions between Cartographic and Web Mercator coordinates', function() {
        it('webMercatorToCartographic is correct at corners', function() {
            var tilingScheme = new WebMercatorTilingScheme();

            var southwest = tilingScheme.webMercatorToCartographic(-20037508.342787, -20037508.342787);
            expect(southwest.longitude).toEqualEpsilon(-Math.PI, CesiumMath.EPSILON12);
            expect(southwest.latitude).toEqualEpsilon(CesiumMath.toRadians(-85.05112878), CesiumMath.EPSILON11);

            var southeast = tilingScheme.webMercatorToCartographic(20037508.342787, -20037508.342787);
            expect(southeast.longitude).toEqualEpsilon(Math.PI, CesiumMath.EPSILON12);
            expect(southeast.latitude).toEqualEpsilon(CesiumMath.toRadians(-85.05112878), CesiumMath.EPSILON11);

            var northeast = tilingScheme.webMercatorToCartographic(20037508.342787, 20037508.342787);
            expect(northeast.longitude).toEqualEpsilon(Math.PI, CesiumMath.EPSILON12);
            expect(northeast.latitude).toEqualEpsilon(CesiumMath.toRadians(85.05112878), CesiumMath.EPSILON11);

            var northwest = tilingScheme.webMercatorToCartographic(-20037508.342787, 20037508.342787);
            expect(northwest.longitude).toEqualEpsilon(-Math.PI, CesiumMath.EPSILON12);
            expect(northwest.latitude).toEqualEpsilon(CesiumMath.toRadians(85.05112878), CesiumMath.EPSILON11);
        });

        it('cartographicToWebMercator is correct at corners.', function() {
            var tilingScheme = new WebMercatorTilingScheme();

            var maxLatitude = CesiumMath.toRadians(85.05112878);

            var southwest = tilingScheme.cartographicToWebMercator(-Math.PI, -maxLatitude);
            expect(southwest.x).toEqualEpsilon(-20037508.342787, CesiumMath.EPSILON3);
            expect(southwest.y).toEqualEpsilon(-20037508.342787, CesiumMath.EPSILON3);

            var southeast = tilingScheme.cartographicToWebMercator(Math.PI, -maxLatitude);
            expect(southeast.x).toEqualEpsilon(20037508.342787, CesiumMath.EPSILON3);
            expect(southeast.y).toEqualEpsilon(-20037508.342787, CesiumMath.EPSILON3);

            var northeast = tilingScheme.cartographicToWebMercator(Math.PI, maxLatitude);
            expect(northeast.x).toEqualEpsilon(20037508.342787, CesiumMath.EPSILON3);
            expect(northeast.y).toEqualEpsilon(20037508.342787, CesiumMath.EPSILON3);

            var northwest = tilingScheme.cartographicToWebMercator(-Math.PI, maxLatitude);
            expect(northwest.x).toEqualEpsilon(-20037508.342787, CesiumMath.EPSILON3);
            expect(northwest.y).toEqualEpsilon(20037508.342787, CesiumMath.EPSILON3);
        });

        it('cartographicToWebMercator y goes to infinity at poles.', function() {
            var tilingScheme = new WebMercatorTilingScheme();

            var southPole = tilingScheme.cartographicToWebMercator(0.0, -CesiumMath.PI_OVER_TWO);
            expect(southPole.y).toEqual(-1/0);

            // Well, at the north pole it doesn't actually return infinity because
            // Math.tan(Math.PI/2) evaluates to 16331778728383844 instead of positive
            // infinity as it should mathematically.  But it returns a big number.
            var northPole = tilingScheme.cartographicToWebMercator(0.0, CesiumMath.PI_OVER_TWO);
            expect(northPole.y).toBeGreaterThan(200000000.0);
        });
    });

    describe('Conversions from cartographic extent to tile indices and back', function() {
        it('extentToTileXY identifies extent of single root tile', function() {
            var tilingScheme = new WebMercatorTilingScheme();
            var tile = tilingScheme.extentToTileXY(tilingScheme.extent, 0);
            expect(tile.x).toEqual(0);
            expect(tile.y).toEqual(0);
        });

        it('tileXYToExtent returns full extent for single root tile.', function() {
            var tilingScheme = new WebMercatorTilingScheme();
            var extent = tilingScheme.tileXYToExtent(0, 0, 0);
            expect(extent.west).toEqualEpsilon(tilingScheme.extent.west, CesiumMath.EPSILON10);
            expect(extent.south).toEqualEpsilon(tilingScheme.extent.south, CesiumMath.EPSILON10);
            expect(extent.east).toEqualEpsilon(tilingScheme.extent.east, CesiumMath.EPSILON10);
            expect(extent.north).toEqualEpsilon(tilingScheme.extent.north, CesiumMath.EPSILON10);
        });

        it('tileXYToExtent for single root tile can be passed back into extentToTileXY.', function() {
            var tilingScheme = new WebMercatorTilingScheme();
            var extent = tilingScheme.tileXYToExtent(0, 0, 0);
            var tile = tilingScheme.extentToTileXY(extent, 0);
            expect(tile.x).toEqual(0);
            expect(tile.y).toEqual(0);
        });

        it('tileXYToExtent for (2, 1) root tiles can be passed back into extentToTileXY.', function() {
            var tilingScheme = new WebMercatorTilingScheme({
                numberOfLevelZeroTilesX : 2,
                numberOfLevelZeroTilesY : 1
            });

            var extent00 = tilingScheme.tileXYToExtent(0, 0, 0);
            var tile00 = tilingScheme.extentToTileXY(extent00, 0);
            expect(tile00.x).toEqual(0);
            expect(tile00.y).toEqual(0);

            var extent10 = tilingScheme.tileXYToExtent(1, 0, 0);
            var tile10 = tilingScheme.extentToTileXY(extent10, 0);
            expect(tile10.x).toEqual(1);
            expect(tile10.y).toEqual(0);
        });

        it('tileXYToExtent for (2, 2) root tiles can be passed back into extentToTileXY.', function() {
            var tilingScheme = new WebMercatorTilingScheme({
                numberOfLevelZeroTilesX : 2,
                numberOfLevelZeroTilesY : 2
            });

            for (var x = 0; x < 2; ++x) {
                for (var y = 0; y < 2; ++y) {
                    var extent = tilingScheme.tileXYToExtent(x, y, 0);
                    var tile = tilingScheme.extentToTileXY(extent, 0);
                    expect(tile.x).toEqual(x);
                    expect(tile.y).toEqual(y);
                }
            }
        });

        it('tileXYToExtent for first level tiles can be passed back into extentToTileXY.', function() {
            var tilingScheme = new WebMercatorTilingScheme();

            for (var x = 0; x < 2; ++x) {
                for (var y = 0; y < 2; ++y) {
                    var extent = tilingScheme.tileXYToExtent(x, y, 1);
                    var tile = tilingScheme.extentToTileXY(extent, 1);
                    expect(tile.x).toEqual(x);
                    expect(tile.y).toEqual(y);
                }
            }
        });

        it('tileXYToExtent for first level tiles can be passed back into extentToTileXY when root has (2,2) tiles.', function() {
            var tilingScheme = new WebMercatorTilingScheme({
                numberOfLevelZeroTilesX : 2,
                numberOfLevelZeroTilesY : 2
            });

            for (var x = 0; x < 4; ++x) {
                for (var y = 0; y < 4; ++y) {
                    var extent = tilingScheme.tileXYToExtent(x, y, 1);
                    var tile = tilingScheme.extentToTileXY(extent, 1);
                    expect(tile.x).toEqual(x);
                    expect(tile.y).toEqual(y);
                }
            }
        });

        it('tiles are numbered from the northwest corner.', function() {
            var tilingScheme = new WebMercatorTilingScheme();
            var northwest = tilingScheme.tileXYToExtent(0, 0, 1);
            var northeast = tilingScheme.tileXYToExtent(1, 0, 1);
            var southeast = tilingScheme.tileXYToExtent(1, 1, 1);
            var southwest = tilingScheme.tileXYToExtent(0, 1, 1);

            expect(northeast.north).toEqual(northwest.north);
            expect(northeast.south).toEqual(northwest.south);
            expect(southeast.north).toEqual(southwest.north);
            expect(southeast.south).toEqual(southwest.south);

            expect(northwest.west).toEqual(southwest.west);
            expect(northwest.east).toEqual(southwest.east);
            expect(northeast.west).toEqual(southeast.west);
            expect(northeast.east).toEqual(southeast.east);

            expect(northeast.north).toBeGreaterThan(southeast.north);
            expect(northeast.south).toBeGreaterThan(southeast.south);
            expect(northwest.north).toBeGreaterThan(southwest.north);
            expect(northwest.south).toBeGreaterThan(southwest.south);

            expect(northeast.east).toBeGreaterThan(northwest.east);
            expect(northeast.west).toBeGreaterThan(northwest.west);
            expect(southeast.east).toBeGreaterThan(southwest.east);
            expect(southeast.west).toBeGreaterThan(southwest.west);
        });

        it('adjacent tiles have overlapping coordinates', function() {
            var tilingScheme = new WebMercatorTilingScheme();
            var northwest = tilingScheme.tileXYToExtent(0, 0, 1);
            var northeast = tilingScheme.tileXYToExtent(1, 0, 1);
            var southeast = tilingScheme.tileXYToExtent(1, 1, 1);
            var southwest = tilingScheme.tileXYToExtent(0, 1, 1);

            expect(northeast.south).toEqualEpsilon(southeast.north, CesiumMath.EPSILON15);
            expect(northwest.south).toEqualEpsilon(southwest.north, CesiumMath.EPSILON15);

            expect(northeast.west).toEqualEpsilon(northwest.east, CesiumMath.EPSILON15);
            expect(southeast.west).toEqualEpsilon(southwest.east, CesiumMath.EPSILON15);
        });
    });
});