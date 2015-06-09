"use strict";

var EPSILON = 0.00001,
    assert = require( 'assert' ),
    Mat33 = require( '../src/Mat33' ),
    Vec3 = require( '../src/Vec3' ),
    Quaternion = require( '../src/Quaternion' );

describe('Quaternion', function() {

    describe('#equals()', function() {
        it('should return false if any components do not match', function() {
            var v = new Quaternion(
                Math.random(),
                Math.random(),
                Math.random(),
                Math.random() );
            assert.equal( v.equals( v ), true );
            assert.equal( v.equals( new Quaternion( v.w, -v.x, v.y, v.z ) ), false );
            assert.equal( v.equals( new Quaternion( v.w, v.x, v.y+5, v.z ) ), false );
            assert.equal( v.equals( new Quaternion( v.w, v.x, v.y, v.z-1.2345 ) ), false );
            assert.equal( v.equals( new Quaternion( v.w*3, v.x, v.y, v.z ) ), false );
            assert.equal( v.equals( new Quaternion( v.w, v.x, v.y, v.z ) ), true );
        });
        it('should return true if all components match', function() {
            var v = new Quaternion(
                Math.random(),
                Math.random(),
                Math.random(),
                Math.random() );
            assert.equal( v.equals( new Quaternion( v.w, v.x, v.y, v.z ) ), true );
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
            var r = Math.random(),
                v = new Quaternion( r, r, r, r );
            assert.equal( v.equals( new Quaternion( r/2, r/2, r/2, r/2 ), r/2 ), true );
        });
    });

    describe('#random()', function() {
        it('should return a Quaternion representing a random orientation', function() {
            var r0 = Quaternion.random(),
                r1 = Quaternion.random();
            assert.equal( r0.equals( new Quaternion( 0, 0, 0, 0 ) ), false );
            assert.equal( r1.equals( new Quaternion( 0, 0, 0, 0 ) ), false );
        });
    });

    describe('#constructor()', function() {
        it('should return an identity quaternion when supplied no arguments', function() {
            var vEmpty = new Quaternion();
            assert.equal( vEmpty.equals( new Quaternion( 1, 0, 0, 0 ) ), true );
        });
        it('should return a quaternion from 4 numerical arguments', function() {
            var p = Math.random(),
                q = Math.random(),
                r = Math.random(),
                s = Math.random(),
                t = new Quaternion( s, p, q, r );
            assert.equal( t.x === p && t.y === q && t.z === r && t.w === s, true );
        });
        it('should return a quaternion from an Array of numerical arguments', function() {
            var p = Math.random(),
                q = Math.random(),
                r = Math.random(),
                s = Math.random(),
                t = new Quaternion([ s, p, q, r ]);
            assert.equal( t.x === p && t.y === q && t.z === r && t.w === s, true );
        });
        it('should return deep copy when supplied another Quaternion', function() {
            var p = Quaternion.random(),
                q = new Quaternion( p );
            assert.equal( p.equals( q ), true );
        });
        it('should return an identity quaternion when given invalid input', function() {
            var p = new Quaternion( NaN, 4 ),
                q = new Quaternion( {"random":Math.random()} ),
                r = new Quaternion( [] ),
                s = new Quaternion( function() {
                    return false;
                }),
                t = new Quaternion( [] );
            assert.equal( p.equals( new Quaternion( 1, 0, 0, 0 ) ), true );
            assert.equal( q.equals( new Quaternion( 1, 0, 0, 0 ) ), true );
            assert.equal( r.equals( new Quaternion( 1, 0, 0, 0 ) ), true );
            assert.equal( s.equals( new Quaternion( 1, 0, 0, 0 ) ), true );
            assert.equal( t.equals( new Quaternion( 1, 0, 0, 0 ) ), true );
        });
    });

    describe('#identity()', function() {
        it('should return a quaternion that results in identity matrix', function() {
            var i = Quaternion.identity(),
                m = i.matrix();
            assert.equal( m.equals( Mat33.identity() ), true );
        });
    });

    describe('#rotationDegrees()', function() {
        it('should return a rotation matrix, rotating counter-clockwise', function() {
            var up = new Vec3( 0, 1, 0 ),
                left = new Vec3( 1, 0, 0 ),
                right = new Vec3( -1, 0, 0 ),
                forward = new Vec3( 0, 0, 1 ),
                up90 = Quaternion.rotationDegrees( 90, up ),
                left90 = Quaternion.rotationDegrees( -90, left ),
                forward90 = Quaternion.rotationDegrees( 90, forward ),
                v0 = up90.rotate( forward ).normalize(),
                v1 = left90.rotate( forward ).normalize(),
                v2 = forward90.rotate( up ).normalize();
            assert.equal( v0.equals( left, EPSILON ), true );
            assert.equal( v1.equals( up, EPSILON ), true );
            assert.equal( v2.equals( right, EPSILON ), true );
        });
        it('should return an identity matrix if given a zero vector as an axis', function() {
            var axis = new Vec3( 0, 0, 0 ),
                angle = Math.random();
            assert.equal( Mat33.rotationDegrees( angle, axis ).equals( Mat33() ), true );
        });
        it('should accept an Array as axis argument', function() {
            var up = [ 0, 1, 0 ],
                left = [ 1, 0, 0 ],
                right = [ -1, 0, 0 ],
                forward = [ 0, 0, 1 ],
                up90 = Quaternion.rotationDegrees( 90, up ),
                left90 = Quaternion.rotationDegrees( -90, left ),
                forward90 = Quaternion.rotationDegrees( 90, forward ),
                v0 = up90.rotate( forward ).normalize(),
                v1 = left90.rotate( forward ).normalize(),
                v2 = forward90.rotate( up ).normalize();
            assert.equal( v0.equals( left, EPSILON ), true );
            assert.equal( v1.equals( up, EPSILON ), true );
            assert.equal( v2.equals( right, EPSILON ), true );
        });
    });

    describe('#rotationRadians()', function() {
        it('should return a rotation matrix, rotating counter-clockwise', function() {
            var up = new Vec3( 0, 1, 0 ),
                left = new Vec3( 1, 0, 0 ),
                right = new Vec3( -1, 0, 0 ),
                forward = new Vec3( 0, 0, 1 ),
                up90 = Quaternion.rotationRadians( 90 * Math.PI / 180, up ),
                left90 = Quaternion.rotationRadians( -90 * Math.PI / 180, left ),
                forward90 = Quaternion.rotationRadians( 90 * Math.PI / 180, forward ),
                v0 = up90.rotate( forward ).normalize(),
                v1 = left90.rotate( forward ).normalize(),
                v2 = forward90.rotate( up ).normalize();
            assert.equal( v0.equals( left, EPSILON ), true );
            assert.equal( v1.equals( up, EPSILON ), true );
            assert.equal( v2.equals( right, EPSILON ), true );
        });
        it('should return an identity matrix if given a zero vector as an axis', function() {
            var axis = new Vec3( 0, 0, 0 ),
                angle = Math.random();
            assert.equal( Mat33.rotationRadians( angle, axis ).equals( Mat33() ), true );
        });
        it('should accept an Array as axis argument', function() {
            var up = [ 0, 1, 0 ],
                left = [ 1, 0, 0 ],
                right = [ -1, 0, 0 ],
                forward = [ 0, 0, 1 ],
                up90 = Quaternion.rotationDegrees( 90, up ),
                left90 = Quaternion.rotationDegrees( -90, left ),
                forward90 = Quaternion.rotationDegrees( 90, forward ),
                v0 = up90.rotate( forward ).normalize(),
                v1 = left90.rotate( forward ).normalize(),
                v2 = forward90.rotate( up ).normalize();
            assert.equal( v0.equals( left, EPSILON ), true );
            assert.equal( v1.equals( up, EPSILON ), true );
            assert.equal( v2.equals( right, EPSILON ), true );
        });
    });

    describe('#matrix', function() {
        it('should return the rotation matrix equivalent', function() {
            var axis = Vec3.random(),
                angle = Math.random(),
                rotMatrix = Mat33.rotationRadians( angle, axis ),
                rotQuaternion = Quaternion.rotationRadians( angle, axis );
            assert.equal( rotMatrix.equals( rotQuaternion.matrix(), EPSILON ), true );
        });
    });

    describe('#mult', function() {
        it('should concatenate supplied quaternions', function() {
            var axisA = Vec3.random(),
                angleA = Math.random(),
                axisB = Vec3.random(),
                angleB = Math.random(),
                rotMatrixA = Mat33.rotationRadians( angleA, axisA ),
                rotMatrixB = Mat33.rotationRadians( angleB, axisB ),
                concatMatrix = rotMatrixA.mult( rotMatrixB ),
                rotQuaternionA = Quaternion.rotationRadians( angleA, axisA ),
                rotQuaternionB = Quaternion.rotationRadians( angleB, axisB ),
                concatQuaternion = rotQuaternionA.mult( rotQuaternionB );
            assert.equal( concatMatrix.equals( concatQuaternion.matrix(), EPSILON ), true );
        });
        it('should accept an Array argument', function() {
            var axisA = Vec3.random(),
                angleA = Math.random(),
                axisB = Vec3.random(),
                angleB = Math.random(),
                rotMatrixA = Mat33.rotationRadians( angleA, axisA ),
                rotMatrixB = Mat33.rotationRadians( angleB, axisB ),
                concatMatrix = rotMatrixA.mult( rotMatrixB ),
                rotQuaternionA = Quaternion.rotationRadians( angleA, axisA ),
                rotQuaternionB = Quaternion.rotationRadians( angleB, axisB ),
                concatQuaternion = rotQuaternionA.mult([
                    rotQuaternionB.w,
                    rotQuaternionB.x,
                    rotQuaternionB.y,
                    rotQuaternionB.z ]);
            assert.equal( concatMatrix.equals( concatQuaternion.matrix(), EPSILON ), true );
        });
    });

    describe('#rotate', function() {
        it('should rotate supplied vectors', function() {
            var axis = Vec3.random(),
                angle = Math.random(),
                vec = Vec3.random(),
                rotMatrix = Mat33.rotationRadians( angle, axis ),
                rotQuaternion = Quaternion.rotationRadians( angle, axis );
            assert.equal( rotMatrix.mult( vec ).equals( rotQuaternion.rotate( vec ), EPSILON ), true );
        });
        it('should accept an Array argument', function() {
            var axis = Vec3.random(),
                angle = Math.random(),
                vec = Vec3.random(),
                rotMatrix = Mat33.rotationRadians( angle, axis ),
                rotQuaternion = Quaternion.rotationRadians( angle, axis );
            assert.equal( rotMatrix.mult( vec ).equals( rotQuaternion.rotate([ vec.x, vec.y, vec.z ]), EPSILON ), true );
        });
    });

    describe('#slerp', function() {
        it('should interpolate between two quaternions', function() {
            var fromQuat = new Quaternion(),
                toQuat = Quaternion.rotationDegrees( 90, [ 0, 0, 1 ] ),
                vec = new Vec3( 0, 1, 0 ),
                quarterRot = Mat33.rotationDegrees( 22.5, [ 0, 0, 1 ] ),
                halfRot = Mat33.rotationDegrees( 45, [ 0, 0, 1 ] ),
                threeQuarterRot = Mat33.rotationDegrees( 67.5, [ 0, 0, 1 ] ),
                quarter = Quaternion.slerp( fromQuat, toQuat, 0.25 ).rotate( vec ),
                half = Quaternion.slerp( fromQuat, toQuat, 0.5 ).rotate( vec ),
                threeQuarter = Quaternion.slerp( fromQuat, toQuat, 0.75 ).rotate( vec );
            assert( quarter.normalize().equals( quarterRot.mult( vec ).normalize(), EPSILON ) );
            assert( half.normalize().equals( halfRot.mult( vec ).normalize(), EPSILON ) );
            assert( threeQuarter.normalize().equals( threeQuarterRot.mult( vec ).normalize(), EPSILON ) );
            assert( Quaternion.slerp( fromQuat, toQuat, 0 ).equals( fromQuat, EPSILON ) );
            assert( Quaternion.slerp( fromQuat, toQuat, 1 ).equals( toQuat, EPSILON ) );
            assert( Quaternion.slerp( fromQuat, fromQuat, undefined ).equals( fromQuat, EPSILON ) );
        });
        it('should accept Arrays as arguments', function() {
            var fromQuat = new Quaternion(),
                toQuat = Quaternion.rotationDegrees( 90, [ 0, 0, 1 ] ),
                vec = new Vec3( 0, 1, 0 ),
                quarterRot = Mat33.rotationDegrees( 22.5, [ 0, 0, 1 ] ),
                halfRot = Mat33.rotationDegrees( 45, [ 0, 0, 1 ] ),
                threeQuarterRot = Mat33.rotationDegrees( 67.5, [ 0, 0, 1 ] ),
                quarter = Quaternion.slerp(
                    [ fromQuat.w, fromQuat.x, fromQuat.y, fromQuat.z ],
                    toQuat,
                    0.25 ).rotate( vec ),
                half = Quaternion.slerp(
                    fromQuat,
                    [ toQuat.w, toQuat.x, toQuat.y, toQuat.z ],
                    0.5 ).rotate( vec ),
                threeQuarter = Quaternion.slerp(
                    [ fromQuat.w, fromQuat.x, fromQuat.y, fromQuat.z ],
                    [ toQuat.w, toQuat.x, toQuat.y, toQuat.z ], 0.75 ).rotate( vec );
            assert( quarter.normalize().equals( quarterRot.mult( vec ).normalize(), EPSILON ) );
            assert( half.normalize().equals( halfRot.mult( vec ).normalize(), EPSILON ) );
            assert( threeQuarter.normalize().equals( threeQuarterRot.mult( vec ).normalize(), EPSILON ) );
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
            assert.equal( Math.sqrt(
                v.x*v.x +
                v.y*v.y +
                v.z*v.z +
                v.w*v.w ) - 1 < EPSILON, true );
        });
        it('should return an identity quaternion if the original length is zero', function() {
            var v = new Quaternion( 0, 0, 0, 0 );
            assert.equal( v.normalize().equals( new Quaternion( 1, 0, 0, 0 ) ), true );
        });
    });

    describe('#toString', function() {
        it('should return a string of comma separated component values', function() {
            var v = Quaternion.random(),
                s = v.toString(),
                a = s.split(',');
            assert.equal( parseFloat( a[0] ) === v.x, true );
            assert.equal( parseFloat( a[1] ) === v.y, true );
            assert.equal( parseFloat( a[2] ) === v.z, true );
            assert.equal( parseFloat( a[3] ) === v.w, true );
        });
    });

    describe('#toArray', function() {
        it('should return an Array with four matching components', function() {
            var v = Quaternion.random(),
                a = v.toArray();
            assert.equal( a instanceof Array, true );
            assert.equal( a.length === 4, true );
            assert.equal( a[0] - v.w < EPSILON, true );
            assert.equal( a[1] - v.x < EPSILON, true );
            assert.equal( a[2] - v.y < EPSILON, true );
            assert.equal( a[3] - v.z < EPSILON, true );
        });
    });

});
