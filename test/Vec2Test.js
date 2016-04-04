(function() {

    'use strict';

    var assert = require('assert');
    var Vec2 = require('../src/Vec2');
    var Vec3 = require('../src/Vec3');
    var Vec4 = require('../src/Vec4');
    var EPSILON = require('../src/Epsilon');

    describe('Vec2', function() {

        describe('#equals()', function() {
            it('should return false if any components do not match', function() {
                var v = new Vec2( Math.random(), Math.random() );
                assert( v.equals( v ) );
                assert( !v.equals( new Vec2( -v.x, v.y ) ) );
                assert( !v.equals( new Vec2( v.x, v.y+5 ) ) );
            });
            it('should return true if all components match', function() {
                var v = new Vec2(
                    Math.random(),
                    Math.random() );
                assert( v.equals( new Vec2( v.x, v.y ) ) );
            });
            it('should accept an array of input', function() {
                var v = new Vec2(
                    Math.random(),
                    Math.random() );
                assert( v.equals( [v.x, v.y ] ) );
            });
            it('should accept a second epsilon parameter, return true if each component is <= epsilon', function() {
                var r = Math.random(),
                    v = new Vec2( r, r );
                assert( v.equals( new Vec2( r/2, r/2 ), r/2 ) );
            });
        });

        describe('#random()', function() {
            it('should return a Vec2 with 2 random components', function() {
                var r0 = Vec2.random();
                var r1 = Vec2.random();
                assert( !r0.equals( new Vec2( 0, 0 ) ) );
                assert( !r1.equals( new Vec2( 0, 0 ) ) );
            });
        });

        describe('#constructor()', function() {
            it('should return a zero vector when supplied no arguments', function() {
                var vEmpty = new Vec2();
                assert( vEmpty.equals( new Vec2( 0, 0 ) ) );
            });
            it('should return a vector from two numerical arguments', function() {
                var p = Math.random();
                var q = Math.random();
                var s = new Vec2( p, q );
                assert( s.x === p && s.y === q );
            });
            it('should return a vector from an array of numerical arguments', function() {
                var p = Math.random();
                var q = Math.random();
                var s = new Vec2([ p, q ]);
                assert( s.x === p && s.y === q );
            });
            it('should return deep copy when supplied another Vec2', function() {
                var p = Vec2.random();
                var q = new Vec2( p );
                assert( p.equals( q ) );
            });
            it('should return a truncated deep copy when supplied another Vec3', function() {
                var p = Vec3.random();
                var q = new Vec2( p );
                var s = new Vec2( p.x, p.y );
                assert( q.equals( s ) );
            });
            it('should return a truncated deep copy when supplied another Vec4', function() {
                var p = Vec4.random();
                var q = new Vec2( p );
                var s = new Vec2( p.x, p.y );
                assert( q.equals( s ) );
            });
            it('should return a zero vector when given invalid input', function() {
                var p = new Vec2( NaN, 4, 3 );
                var r = new Vec2( {} );
                var s = new Vec2( function() {});
                var t = new Vec2( [] );
                assert( p.equals( new Vec2( 0, 0 ) ) );
                assert( r.equals( new Vec2( 0, 0 ) ) );
                assert( s.equals( new Vec2( 0, 0 ) ) );
                assert( t.equals( new Vec2( 0, 0 ) ) );
            });
        });

        describe('#negate', function() {
            it('should return a Vec2 with each component negated', function() {
                var v = Vec2.random();
                assert( v.negate().equals( new Vec2( -v.x, -v.y ) ) );
            });
        });

        describe('#add', function() {
            it('should return a value of self + argument', function() {
                var v0 = Vec2.random();
                var v1 = Vec2.random();
                var v2 = [ Math.random(), Math.random() ];
                assert( v0.add( v1 ).equals( new Vec2( v0.x + v1.x, v0.y + v1.y ) ) );
                assert( v0.add( v2 ).equals( new Vec2( v0.x + v2[0], v0.y + v2[1] ) ) );
            });
        });

        describe('#sub', function() {
            it('should return a value of self - argument', function() {
                var v0 = Vec2.random();
                var v1 = Vec2.random();
                var v2 = [ Math.random(), Math.random() ];
                assert( v0.sub( v1 ).equals( new Vec2( v0.x - v1.x, v0.y - v1.y ) ) );
                assert( v0.sub( v2 ).equals( new Vec2( v0.x - v2[0], v0.y - v2[1] ) ) );
            });
        });

        describe('#divScalar', function() {
            it('should return a value of self / scalar argument', function() {
                var v = Vec2.random();
                var r = Math.random();
                assert( v.divScalar( r ).equals( new Vec2( v.x / r, v.y / r ) ) );
            });
        });

        describe('#multScalar', function() {
            it('should return a value of self * scalar argument', function() {
                var v = Vec2.random();
                var r = Math.random();
                assert( v.multScalar( r ).equals( new Vec2( v.x * r, v.y * r ) ) );
            });
        });

        describe('#dot', function() {
            it('should return the dot product', function() {
                var v0 = Vec2.random();
                var v1 = Vec2.random();
                var v2 = [ Math.random(), Math.random() ];
                assert( v0.dot( v1 ) === v0.x * v1.x + v0.y * v1.y );
                assert( v0.dot( v2 ) === v0.x * v2[0] + v0.y * v2[1] );
            });
        });

        describe('#cross', function() {
            it('should return the scalar cross product', function() {
                var v0 = Vec2.random();
                var v1 = Vec2.random();
                var c = ( v0.x * v1.y ) - ( v0.y * v1.x );
                assert( v0.cross( v1 ) === c );
                assert( v0.cross([ v1.x, v1.y ]) === c );
            });
        });

        describe('#length', function() {
            it('with no argument, should return the length of the vector', function() {
                var v0 = new Vec2( 1, 1 );
                var r = Math.random();
                var v1 = new Vec2( r, 0  );
                var v2 = Vec2.random().normalize();
                assert( v0.length() - Math.sqrt(2) < EPSILON  );
                assert( v1.length() - r < EPSILON  );
                assert( v2.length() - 1.0 < EPSILON );
            });
            it('when passed an argument, should return an equivolent vector with the specified length', function() {
                var v = Vec2.random();
                var l = Math.random();
                assert( v.length( l ).length() - 1 < EPSILON );
            });
        });

        describe('#lengthSquared', function() {
            it('should return the squared length of the vector', function() {
                var v0 = new Vec2( 1, 1 );
                var r = Math.random();
                var v1 = new Vec2( r, 0 );
                var v2 = Vec2.random().normalize();
                assert( v0.lengthSquared() - 2 < EPSILON  );
                assert( v1.lengthSquared() - r*r < EPSILON  );
                assert( v2.lengthSquared() - 1.0 < EPSILON );
            });
        });

        describe('#normalize', function() {
            it('should return an equivolent vector of unit length', function() {
                var v = Vec2.random();
                v.x += 1;
                v.y += 1;
                assert( v.normalize().length() - 1 < EPSILON );
            });
            it('should throw an exception if length is zero', function() {
                var v = new Vec2( 0, 0 );
                var result = false;
                try {
                    v.normalize();
                } catch( err ) {
                    result = true;
                }
                assert( result );
            });
        });

        describe('#unsignedAngle', function() {
            it('should return the unsigned angle between the provided vector, in radians', function() {
                var a = new Vec2( 1, 0 );
                var b = [ 1, 1 ];
                var c = new Vec2( 0, 1 );
                var d = new Vec2( -1, 1 );
                var e = new Vec2( -1, 0 );
                var f = new Vec2( -1, -1 );
                var g = new Vec2( 0, -1 );
                var h = new Vec2( 1, -1 );
                assert( Math.abs( a.unsignedAngle( b ) - Math.PI/4 ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( c ) - Math.PI/2 ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( d ) - Math.PI*0.75 ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( e ) - Math.PI ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( f ) - ( Math.PI + Math.PI/4 ) ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( g ) - ( Math.PI + Math.PI/2 ) ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( h ) - ( Math.PI + Math.PI*0.75 ) ) < EPSILON );
            });
            it('should return an angle in the range 0 to 2PI', function() {
                var a = new Vec2( 1, 0 );
                var b = new Vec2( 1, 0.0001 );
                var c = new Vec2( 1, -0.0001 );
                var d = new Vec2( -1, -0.0001 );
                assert( Math.abs( a.unsignedAngle( b ) )  < 0.0001 );
                assert( Math.abs( a.unsignedAngle( c ) - Math.PI*2 ) < 0.0001 );
                assert( Math.abs( a.unsignedAngle( d ) - Math.PI ) < 0.0001 );
            });
            it('should measure the rotation counter-clockwise', function() {
                var a = new Vec2( 1, 0 );
                var b = new Vec2( 1, 1 );
                var c = new Vec2( 0, -1 );
                assert( Math.abs( a.unsignedAngle( b ) ) - Math.PI/4 < EPSILON );
                assert( Math.abs( a.unsignedAngle( c ) ) - Math.PI*1.5 < EPSILON );
            });
        });

        describe('#toString', function() {
            it('should return a string of comma separated component values', function() {
                var v = Vec2.random();
                var s = v.toString();
                var a = s.split(',');
                assert( parseFloat( a[0] ) === v.x );
                assert( parseFloat( a[1] ) === v.y );
            });
        });

        describe('#toArray', function() {
            it('should return an Array with two matching components', function() {
                var v = Vec2.random();
                var a = v.toArray();
                assert( a instanceof Array );
                assert( a.length === 2 );
                assert( a[0] - v.x < EPSILON );
                assert( a[1] - v.y < EPSILON );
            });
        });

    });

}());
