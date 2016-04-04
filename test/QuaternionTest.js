(function() {

    'use strict';

    var assert = require('assert');
    var Mat33 = require('../src/Mat33');
    var Vec3 = require('../src/Vec3');
    var Quaternion = require('../src/Quaternion');
    var EPSILON = require('../src/Epsilon');

    describe('Quaternion', function() {

        describe('#equals()', function() {
            it('should return false if any components do not match', function() {
                var v = new Quaternion(
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    Math.random() );
                assert( v.equals( v ) );
                assert( !v.equals( new Quaternion( v.w, -v.x, v.y, v.z ) ) );
                assert( !v.equals( new Quaternion( v.w, v.x, v.y+5, v.z ) ) );
                assert( !v.equals( new Quaternion( v.w, v.x, v.y, v.z-1.2345 ) ) );
                assert( !v.equals( new Quaternion( v.w*3, v.x, v.y, v.z ) ) );
                assert( v.equals( new Quaternion( v.w, v.x, v.y, v.z ) ) );
            });
            it('should return true if all components match', function() {
                var v = new Quaternion(
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    Math.random() );
                assert( v.equals( new Quaternion( v.w, v.x, v.y, v.z ) ) );
            });
            it('should accept and array of input', function() {
                var v = new Quaternion(
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    Math.random() );
                assert( v.equals( [ v.w, v.x, v.y, v.z ] ) );
            });
            it('should accept a second epsilon parameter, return true if each component is <= epsilon', function() {
                var r = Math.random();
                var q = new Quaternion( r, r, r, r );
                assert( q.equals( new Quaternion( r/2, r/2, r/2, r/2 ), r/2 ) );
            });
        });

        describe('#random()', function() {
            it('should return a Quaternion representing a random orientation', function() {
                Quaternion.random();
            });
        });

        describe('#constructor()', function() {
            it('should return an identity quaternion when supplied no arguments', function() {
                var empty = new Quaternion();
                assert( empty.equals( Quaternion.identity() ) );
            });
            it('should return a quaternion from 4 numerical arguments', function() {
                var a = Math.random();
                var b = Math.random();
                var c = Math.random();
                var d = Math.random();
                var q = new Quaternion( a, b, c, d );
                assert( q.x === b && q.y === c && q.z === d && q.w === a );
            });
            it('should return a quaternion from an Array of numerical arguments', function() {
                var a = Math.random();
                var b = Math.random();
                var c = Math.random();
                var d = Math.random();
                var q = new Quaternion([ a, b, c, d ]);
                assert( q.x === b && q.y === c && q.z === d && q.w === a );
            });
            it('should return deep copy when supplied another Quaternion', function() {
                var r = Quaternion.random();
                var q = new Quaternion( r );
                assert( r.equals( q ) );
            });
            it('should return an identity quaternion when given invalid input', function() {
                var p = new Quaternion( NaN, 4 );
                var q = new Quaternion( {} );
                var r = new Quaternion( [] );
                var s = new Quaternion( function() {} );
                assert( p.equals( Quaternion.identity() ) );
                assert( q.equals( Quaternion.identity() ) );
                assert( r.equals( Quaternion.identity() ) );
                assert( s.equals( Quaternion.identity() ) );
            });
        });

        describe('#identity()', function() {
            it('should return a quaternion that results in identity matrix', function() {
                var i = Quaternion.identity();
                var m = i.matrix();
                assert( m.equals( Mat33.identity() ) );
            });
        });

        describe('#negate', function() {
            it('should return a Quaternion with each component negated', function() {
                var q = Quaternion.random();
                assert( q.negate().equals( new Quaternion( -q.w, -q.x, -q.y, -q.z ) ) );
            });
        });

        describe('#rotation()', function() {
            it('should return a rotation matrix, rotating counter-clockwise', function() {
                var up = new Vec3( 0, 1, 0 );
                var left = new Vec3( 1, 0, 0 );
                var right = new Vec3( -1, 0, 0 );
                var forward = new Vec3( 0, 0, 1 );
                var up90 = Quaternion.rotation( Math.PI / 2, up );
                var left90 = Quaternion.rotation( -Math.PI / 2, [ left.x, left.y, left.z ] );
                var forward90 = Quaternion.rotation( Math.PI / 2, forward );
                var v0 = up90.rotate( forward ).normalize();
                var v1 = left90.rotate( forward ).normalize();
                var v2 = forward90.rotate( up ).normalize();
                assert( v0.equals( left, EPSILON ) );
                assert( v1.equals( up, EPSILON ) );
                assert( v2.equals( right, EPSILON ) );
            });
            it('should throw an exception if given a zero vector as an axis', function() {
                var axis = new Vec3( 0, 0, 0 );
                var angle = Math.random();
                var result = false;
                try {
                    Quaternion.rotation( angle, axis );
                } catch( err ) {
                    result = true;
                }
                assert( result );
            });
        });

        describe('#rotationFromTo()', function() {
            it('should return a quaternion representing the rotation from vector A to B', function() {
                var r = Vec3.random().normalize();
                var s = Vec3.random().normalize();
                var rs = Quaternion.rotationFromTo( r, s ).rotate( r ).normalize();
                var sr = Quaternion.rotationFromTo( s, r ).rotate( s ).normalize();
                assert( rs.equals( s, EPSILON ) );
                assert( sr.equals( r, EPSILON ) );
            });
        });

        describe('#matrix', function() {
            it('should return the rotation matrix equivalent', function() {
                var axis = Vec3.random();
                var angle = Math.random();
                var rotMatrix = Mat33.rotation( angle, axis );
                var rotQuaternion = Quaternion.rotation( angle, axis );
                assert( rotMatrix.equals( rotQuaternion.matrix(), EPSILON ) );
            });
        });

        describe('#multQuat', function() {
            it('should concatenate supplied quaternions', function() {
                var axisA = Vec3.random();
                var angleA = Math.random();
                var axisB = Vec3.random();
                var angleB = Math.random();
                var rotMatrixA = Mat33.rotation( angleA, axisA );
                var rotMatrixB = Mat33.rotation( angleB, axisB );
                var concatMatrix = rotMatrixA.multMat33( rotMatrixB );
                var rotQuaternionA = Quaternion.rotation( angleA, [ axisA.x, axisA.y, axisA.z ] );
                var rotQuaternionB = Quaternion.rotation( angleB, axisB );
                var concatQuaternionA = rotQuaternionA.multQuat( rotQuaternionB );
                var concatQuaternionB = rotQuaternionA.multQuat([
                    rotQuaternionB.w,
                    rotQuaternionB.x,
                    rotQuaternionB.y,
                    rotQuaternionB.z
                ]);
                assert( concatMatrix.equals( concatQuaternionA.matrix(), EPSILON ) );
                assert( concatMatrix.equals( concatQuaternionB.matrix(), EPSILON ) );
            });
        });

        describe('#rotate', function() {
            it('should rotate supplied vectors', function() {
                var axis = Vec3.random();
                var angle = Math.random();
                var vec = Vec3.random();
                var rotMatrix = Mat33.rotation( angle, axis );
                var rotQuaternion = Quaternion.rotation( angle, axis );
                assert( rotMatrix.multVec3( vec ).equals( rotQuaternion.rotate( vec ), EPSILON ) );
                assert( rotMatrix.multVec3( vec ).equals( rotQuaternion.rotate([ vec.x, vec.y, vec.z ]), EPSILON ) );
            });
        });

        describe('#slerp', function() {
            it('should interpolate between two quaternions', function() {
                var fromQuat = Quaternion.rotation( 0, [ 0, 0, 1 ] );
                var toQuat0 = Quaternion.rotation( Math.PI / 2, [ 0, 0, 1 ] );
                var toQuat1 = Quaternion.rotation( Math.PI, [ 0, 0, 1 ] );
                var vec = new Vec3( 0, 1, 0 );
                var quarterRot = Mat33.rotation( Math.PI / 8, [ 0, 0, 1 ] );
                var halfRot = Mat33.rotation( Math.PI / 4, [ 0, 0, 1 ] );
                var threeQuarterRot = Mat33.rotation( Math.PI * 3/8, [ 0, 0, 1 ] );
                var quarter = Quaternion.slerp(
                    [ fromQuat.w, fromQuat.x, fromQuat.y, fromQuat.z ],
                    [ toQuat0.w, toQuat0.x, toQuat0.y, toQuat0.z ], 0.25 ).rotate( vec );
                var half = Quaternion.slerp( fromQuat, toQuat0, 0.5 ).rotate( vec );
                var threeQuarter = Quaternion.slerp( fromQuat, toQuat0, 0.75 ).rotate( vec );
                assert( quarter.normalize().equals( quarterRot.multVec3( vec ).normalize(), EPSILON ) );
                assert( half.normalize().equals( halfRot.multVec3( vec ).normalize(), EPSILON ) );
                assert( threeQuarter.normalize().equals( threeQuarterRot.multVec3( vec ).normalize(), EPSILON ) );
                assert( Quaternion.slerp( fromQuat, toQuat0, 0 ).equals( fromQuat, EPSILON ) );
                assert( Quaternion.slerp( fromQuat, toQuat0, 1 ).equals( toQuat0, EPSILON ) );
                assert( Quaternion.slerp( fromQuat, toQuat1, 0 ).equals( fromQuat, EPSILON ) );
                assert( Quaternion.slerp( fromQuat, toQuat1, 1 ).equals( toQuat1, EPSILON ) );
            });
            it('should return the same vector if both vectors are identical', function() {
                var fromQuat = Quaternion.rotation( 0, [ 0, 0, 1 ] ),
                    toQuat = Quaternion.rotation( 0, [ 0, 0, 1 ] );
                assert( Quaternion.slerp( fromQuat, toQuat, 0 ).equals( fromQuat ) );
            });
        });

        describe('#normalize', function() {
            it('should return an equivolent quaternion of unit length', function() {
                var v = Quaternion.random();
                v.x += 1;
                v.y += 1;
                v.z += 1;
                v.z += 1;
                v = v.normalize();
                assert( Math.sqrt(
                    v.x*v.x +
                    v.y*v.y +
                    v.z*v.z +
                    v.w*v.w ) - 1 < EPSILON );
            });
            it('should return an identity quaternion if the original length is zero', function() {
                var v = new Quaternion( 0, 0, 0, 0 );
                assert( v.normalize().equals( Quaternion.identity() ) );
            });
        });

        describe('#toString', function() {
            it('should return a string of comma separated component values', function() {
                var v = Quaternion.random();
                var s = v.toString();
                var a = s.split(',');
                assert( parseFloat( a[0] ) === v.x );
                assert( parseFloat( a[1] ) === v.y );
                assert( parseFloat( a[2] ) === v.z );
                assert( parseFloat( a[3] ) === v.w );
            });
        });

        describe('#toArray', function() {
            it('should return an Array with four matching components', function() {
                var v = Quaternion.random();
                var a = v.toArray();
                assert( a instanceof Array );
                assert( a.length === 4 );
                assert( a[0] - v.w < EPSILON );
                assert( a[1] - v.x < EPSILON );
                assert( a[2] - v.y < EPSILON );
                assert( a[3] - v.z < EPSILON );
            });
        });

    });

}());
