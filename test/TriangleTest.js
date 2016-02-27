(function() {

    'use strict';

    var EPSILON = 0.00001,
        assert = require( 'assert' ),
        Vec3 = require( '../src/Vec3' ),
        Triangle = require( '../src/Triangle' );

    var _log, _warn, _error;

    function muteConsole() {
        _log = console.log;
        _warn = console.warn;
        _error = console.error;
        console.log = function() {};
        console.warn = function() {};
        console.error = function() {};
    }

    function unmuteConsole() {
        console.log = _log;
        console.warn = _warn;
        console.error = _error;
        _log = null;
        _warn= null;
        _error = null;
    }

    describe('Triangle', function() {

        beforeEach( function() {
            muteConsole();
        });

        afterEach( function() {
            unmuteConsole();
        });

        describe('#equals()', function() {
            it('should return false if any components do not match', function() {
                var a = new Vec3.random(),
                    b = new Vec3.random(),
                    c = new Vec3.random(),
                    t = new Triangle( a, b, c );
                assert( !t.equals( new Triangle( a.add( [ 1, 0 , 0 ] ), b, c ) ) );
                assert( !t.equals( new Triangle( a, b.add( [ 1, 0 , 0 ] ), c ) ) );
                assert( !t.equals( new Triangle( a, b, c.add( [ 1, 0 , 0 ] ) ) ) );
            });
            it('should return true if all components match', function() {
                var a = new Vec3.random(),
                    b = new Vec3.random(),
                    c = new Vec3.random(),
                    t = new Triangle( a, b, c );
                assert( t.equals( new Triangle( a, b, c ) ) );
            });
            it('should accept a second epsilon parameter, return true if each component is <= epsilon', function() {
                var a = new Vec3.random(),
                    b = new Vec3.random(),
                    c = new Vec3.random(),
                    t = new Triangle( a, b, c );
                assert( t.equals( new Triangle( a.add( [ 0.9, 0 , 0 ] ), b, c ), 1 ) );
                assert( t.equals( new Triangle( a, b.add( [ 0.9, 0 , 0 ] ), c ), 1 ) );
                assert( t.equals( new Triangle( a, b, c.add( [ 0.9, 0 , 0 ] ) ), 1 ) );
            });
        });

        describe('#random()', function() {
            it('should return a random triangle with a unit radius', function() {
                var t = Triangle.random();
                assert( Math.abs( 1 - t.radius() ) < EPSILON );
            });
        });

        describe('#constructor()', function() {
            it('should return a triangle containing three positions', function() {
                var a = new Vec3( 0, 0, 0 ),
                    b = new Vec3( 1, 0, 0 ),
                    c = new Vec3( 1, 1, 0 ),
                    t = new Triangle( a, b, c );
                assert( t.a.equals( a ) );
                assert( t.b.equals( b ) );
                assert( t.c.equals( c ) );
            });
            it('should accept an array of vectors', function() {
                var a = new Vec3( 0, 0, 0 ),
                    b = new Vec3( 1, 0, 0 ),
                    c = new Vec3( 1, 1, 0 ),
                    t = new Triangle( a, b, c );
                assert( t.a.equals( a ) );
                assert( t.b.equals( b ) );
                assert( t.c.equals( c ) );
            });
            it('should accept an object containing the `a`, `b`, and `c` components', function() {
                var a = new Vec3( 0, 0, 0 ),
                    b = new Vec3( 1, 0, 0 ),
                    c = new Vec3( 1, 1, 0 ),
                    t = new Triangle({
                        a: a,
                        b: b,
                        c: c
                    });
                assert( t.a.equals( a ) );
                assert( t.b.equals( b ) );
                assert( t.c.equals( c ) );
            });
            it('should default to components [0,0,0], [1,0,0], and [1,1,0] if no arguments are provided', function() {
                var t = new Triangle();
                assert( t.a.equals( [ 0, 0, 0 ] ) );
                assert( t.b.equals( [ 1, 0, 0 ] ) );
                assert( t.c.equals( [ 1, 1, 0 ] ) );
            });
            it('should convert any positions to instances of Vec3', function() {
                var t = new Triangle( [ 0, 0, 0 ], [ 1, 0, 0 ], [ 1, 1, 0 ] );
                assert( t.a instanceof Vec3 );
                assert( t.b instanceof Vec3 );
                assert( t.c instanceof Vec3 );
            });
        });

        describe('#normal()', function() {
            it('should return the normal of the triangle', function() {
                var t = Triangle.random(),
                    ab = t.b.sub( t.a ),
                    ac = t.c.sub( t.a ),
                    normal = ab.cross( ac ).normalize();
                assert( normal.equals( t.normal() ) );
            });
        });

        describe('#area()', function() {
            it('should return the area of the triangle', function() {
                var t = new Triangle(
                    [ 0, 0, 0 ],
                    [ 2, 0, 0 ],
                    [ 2, 2, 0 ]
                );
                assert( t.area() === 2.0 );
            });
        });

        describe('#isInside()', function() {
            it('should return bool if point is contained in the triangle', function() {
                var t = new Triangle(
                    [ 0, 0, 0 ],
                    [ 2, 0, 0 ],
                    [ 2, 2, 0 ]
                );
                var p0 = [ 1.0, 0.8, 0.0 ];
                var p1 = [ 3.0, 0.0, 0.0 ];
                var p2 = [ 3.0, 3.0, 0.0 ];
                assert( t.isInside( p0 ) );
                assert( !t.isInside( p1 ) );
                assert( !t.isInside( p2 ) );
            });
            it('should only return true if the point is co-planar with the triangle', function() {
                var t = new Triangle(
                    [ 0, 0, 0 ],
                    [ 2, 0, 0 ],
                    [ 2, 2, 0 ]
                );
                var p = [ 1.0, 0.8, 10.0 ];
                assert( !t.isInside( p ) );
            });
            it('should return true if p === a', function() {
                var t = new Triangle(
                    [ 0, 0, 0 ],
                    [ 2, 0, 0 ],
                    [ 2, 2, 0 ]
                );
                assert( t.isInside([ 0, 0, 0 ]) );
            })
            ;it('should return true if p === b', function() {
                var t = new Triangle(
                    [ 0, 0, 0 ],
                    [ 2, 0, 0 ],
                    [ 2, 2, 0 ]
                );
                assert( t.isInside([ 2, 0, 0 ]) );
            });
            it('should return true if p === c', function() {
                var t = new Triangle(
                    [ 0, 0, 0 ],
                    [ 2, 0, 0 ],
                    [ 2, 2, 0 ]
                );
                assert( t.isInside([ 2, 2, 0 ]) );
            });
        });

        describe('#intersect()', function() {
            it('should return false if no intersection takes place', function() {
                var t = new Triangle(
                    [ 0, 0, 0 ],
                    [ 2, 0, 0 ],
                    [ 2, 2, 0 ]
                );
                var o = [ 0, 0, 10 ];
                var d = [ 3, 3, -1 ];
                assert( t.intersect( o, d, true, true ) === false );
            });
            it('should return an intersection object if one takes place', function() {
                var t = new Triangle(
                    [ 0, 0, 0 ],
                    [ 2, 0, 0 ],
                    [ 2, 2, 0 ]
                );
                var o = [ 1, 0.5, 10 ];
                var d = [ 0, 0, -1 ];
                assert( t.intersect( o, d, true, true ) !== false );
            });
            it('should provide interface for ignoring behind the point of origin', function() {
                var t = new Triangle(
                    [ 0, 0, 0 ],
                    [ 2, 0, 0 ],
                    [ 2, 2, 0 ]
                );
                var o = [ 1, 0.5, 10 ];
                var d = [ 0, 0, 1 ];
                // ignore
                assert( t.intersect( o, d, true, true ) === false );
                assert( t.intersect( o, d, true, false ) === false );
                // don't ignore
                assert( t.intersect( o, d, false, true ) !== false );
                assert( t.intersect( o, d, false, false ) !== false );
            });
            it('should provide interface for ignoring triangles facing opposite the direction of intersection', function() {
                var t = new Triangle(
                    [ 0, 0, 0 ],
                    [ 2, 0, 0 ],
                    [ 2, 2, 0 ]
                );
                var o = [ 1, 0.5, -10 ];
                var d = [ 0, 0, 1 ];
                // ignore
                assert( t.intersect( o, d, true, true ) === false );
                assert( t.intersect( o, d, false, true ) === false );
                // don't ignore
                assert( t.intersect( o, d, true, false ) !== false );
                assert( t.intersect( o, d, false, false ) !== false );
            });
            it('should always return false to directions perpendicular to the normal', function() {
                var t = new Triangle(
                    [ 0, 0, 0 ],
                    [ 2, 0, 0 ],
                    [ 2, 2, 0 ]
                );
                var o = [ 0, 0, 0 ];
                var d = [ 3, 3, 0 ];
                assert( t.intersect( o, d, true, true ) === false );
                assert( t.intersect( o, d, true, false ) === false );
                assert( t.intersect( o, d, false, true ) === false );
                assert( t.intersect( o, d, false, false ) === false );
            });
        });

        describe('#closestPoint()', function() {
            it('should return the closest point on the triangle to the provided', function() {
                var t = new Triangle(
                    [ 0, 0, 0 ],
                    [ 2, 0, 0 ],
                    [ 2, 2, 0 ]
                );
                assert( t.closestPoint([ 0, 0, 0 ]).equals([ 0, 0, 0 ]) );
                assert( t.closestPoint([ 3, 0, 0 ]).equals([ 2, 0, 0 ]) );
                assert( t.closestPoint([ 3, 3, 0 ]).equals([ 2, 2, 0 ]) );
                t = Triangle.random();
                var ab = t.b.sub( t.a );
                var bc = t.c.sub( t.b );
                var ca = t.a.sub( t.c );
                var abm = t.a.add( ab.normalize().mult( ab.length() / 2 ) );
                var bcm = t.b.add( bc.normalize().mult( bc.length() / 2 ) );
                var cam = t.c.add( ca.normalize().mult( ca.length() / 2 ) );
                var abp = ab.cross( t.normal() ).normalize();
                var bcp = bc.cross( t.normal() ).normalize();
                var cap = ca.cross( t.normal() ).normalize();
                assert( t.closestPoint( abm.add( abp ) ).equals( abm, EPSILON ) );
                assert( t.closestPoint( bcm.add( bcp ) ).equals( bcm, EPSILON ) );
                assert( t.closestPoint( cam.add( cap ) ).equals( cam, EPSILON ) );
            });
        });

        describe('#radius()', function() {
            it('should return the radius of the bounding sphere of the triangle', function() {
                var a = Vec3.random().mult( Math.random() ),
                    b = Vec3.random().mult( Math.random() ),
                    c = Vec3.random().mult( Math.random() ),
                    centroid = a.add( b ).add( c ).div( 3 ),
                    aLength = centroid.sub( a ).length(),
                    bLength = centroid.sub( b ).length(),
                    cLength = centroid.sub( c ).length(),
                    radius = Math.max( Math.max( aLength, bLength ), cLength ),
                    t = new Triangle([ a, b, c ]);
                assert( Math.abs( radius - t.radius() ) < EPSILON );
            });
        });

        describe('#centroid()', function() {
            it('should return the centroid of the triangle', function() {
                var a = Vec3.random().mult( Math.random() ),
                    b = Vec3.random().mult( Math.random() ),
                    c = Vec3.random().mult( Math.random() ),
                    t = new Triangle([ a, b, c ]),
                    centroid = a.add( b ).add( c ).div( 3 );
                assert( centroid.equals( t.centroid() ) );
            });
        });

        describe('#toString', function() {
            it('should return a string of comma separated positions', function() {
                var t = Triangle.random(),
                    str = t.a + ', ' +
                        t.b + ', ' +
                        t.c;
                assert( t.toString() === str );
            });
        });

    });

}());
