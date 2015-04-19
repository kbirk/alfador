"use strict";

var EPSILON = 0.00001,
    assert = require( 'assert' ),
    Vec3 = require( '../src/Vec3' ),
    Triangle = require( '../src/Triangle' );

describe('Triangle', function() {

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
            assert( !t.equals( new Triangle( a.add( [ 0.99, 0 , 0 ] ), b, c ), 1 ) );
            assert( !t.equals( new Triangle( a, b.add( [ 0.99, 0 , 0 ] ), c ), 1 ) );
            assert( !t.equals( new Triangle( a, b, c.add( [ 0.99, 0 , 0 ] ) ), 1 ) );
        });
    });

    describe('#random()', function() {
        it('should return a random triangle with a unit radius', function() {
            var t = Triangle.random();
            console.log( t.radius() );
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
        it('should accept an object containing the "a", "b", and "c" components', function() {
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
    });

    describe('#normal()', function() {
        it('should return the normal of the triangle', function() {
            var t = Triangle.random(),
                ab = t.b.sub( t.a ),
                ac = t.c.sub( t.a ),
                normal = ab.cross( ac ).normalize();
            assert( normal.equals( t.normal() ) );
        });
        it('should cache the normal if the triangle positions are unchanged', function() {
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
        it('should cache the radius if the triangle positions are unchanged', function() {
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
        it('should cache the centroid if the triangle positions are unchanged', function() {
        });
    });

    describe('#toString', function() {
        it('should return a string of comma separated positions', function() {
            var t = Triangle.random(),
                str = t.a + ", " +
                    t.b + ", " +
                    t.c;
            assert( t.toString() === str );
        });
    });

});
