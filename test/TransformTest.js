(function() {

    'use strict';

    var assert = require('assert');
    var Mat44 = require('../src/Mat44');
    var Vec3 = require('../src/Vec3');
    var Transform = require('../src/Transform');
    var Quaternion = require('../src/Quaternion');
    var EPSILON = require('../src/Epsilon');

    describe('Transform', function() {

        describe('#equals()', function() {
            it('should return false if any components do not match', function() {
                var m = Mat44.random();
                var t = new Transform( m );
                var q, i;
                for ( i=0; i<m.data.length; i++ ) {
                    if ( i === 3 || i === 7 || i === 11 || i === 15 ) {
                        continue;
                    }
                    q = new Mat44( m );
                    q.data[i] = q.data[i] + 1;
                    assert( !t.equals( new Transform( q ) ) );
                }
            });
            it('should return true if all components match', function() {
                var m = Mat44.random();
                var p = new Transform( m );
                var q = new Transform( m );
                assert( p.equals( q ) );
            });
            it('should accept a second epsilon parameter, return true if each component is <= epsilon', function() {
                var m = Mat44.random();
                var p = new Transform( m );
                var q = new Transform( m );
                q.rotateWorld( 0.1 * ( Math.PI / 180 ), new Vec3( 0, 1, 0 ) );
                assert( p.equals( q, 1.0 ) );
            });
        });

        describe('#constructor()', function() {
            it('should return an identity Transform when no, or improper arguments are provided', function() {
                var t = new Transform();
                var u = new Transform( 'improper' );
                var v = new Transform( 4, new Vec3() );
                assert( t.matrix().equals( Mat44.identity() ) );
                assert( u.matrix().equals( Mat44.identity() ) );
                assert( v.matrix().equals( Mat44.identity() ) );
            });
            it('should return a deep copy Transform when a single Transform argument is provided', function() {
                var t = Transform.random();
                var s = new Transform( t );
                assert( t.rotation.equals( s.rotation, EPSILON ) );
                assert( t.rotation !== s.rotation );
                assert( t.translation.equals( s.translation, EPSILON ) );
                assert( t.translation !== s.translation );
                assert( t.scale.equals( s.scale, EPSILON ) );
                assert( t.scale !== s.scale );
                assert( t !== s );
            });
            it('should construct a Transform using rotation, translation and scale arguments, defaulting scale to 1', function() {
                var rotation = Quaternion.random();
                var translation = Vec3.random();
                var scale = Math.random();
                var t = new Transform({
                    rotation: rotation,
                    translation: translation,
                    scale: scale
                });
                assert( t.rotation.equals( rotation, EPSILON ) );
                assert( t.translation.equals( translation ) );
                assert( t.scale.equals([ scale, scale, scale ]) );
            });
            it('should construct a Transform from corresponding affine transformation matrix components', function() {
                var a = Transform.random();
                var b = new Transform( a.matrix() );
                var c = new Transform( a.matrix().toMat33() );
                assert( a.rotation.equals( b.rotation, EPSILON ) );
                assert( a.translation.equals( b.translation, EPSILON ) );
                assert( a.scale.equals( b.scale, EPSILON ) );
                assert( a.rotation.equals( c.rotation, EPSILON ) );
                assert( a.scale.equals( c.scale, EPSILON ) );
            });
        });

        describe('#random()', function() {
            it('should return a Transform with all random components', function() {
                Transform.random();
            });
        });

        describe('#identity', function() {
            it('should return a identity Transform', function() {
                var t = Transform.identity();
                assert( t.xAxis().equals([ 1, 0, 0 ]) );
                assert( t.yAxis().equals([ 0, 1, 0 ]) );
                assert( t.zAxis().equals([ 0, 0, 1 ]) );
                assert( t.translation.equals([ 0, 0, 0 ]) );
                assert( t.scale.equals([ 1, 1, 1 ]) );
            });
        });

        describe('#rotateXTo', function() {
            it('should rotate the transform such that the x-axis aligns with the provided vector', function() {
                var v = Vec3.random().normalize();
                var a = new Transform().rotateXTo( v );
                var b = new Transform().rotateXTo([ v.x, v.y, v.z ]);
                assert( v.equals( a.xAxis(), EPSILON ) );
                assert( v.equals( b.xAxis(), EPSILON ) );
            });
        });

        describe('#rotateYTo', function() {
            it('should rotate the transform such that the y-axis aligns with the provided vector', function() {
                var v = Vec3.random().normalize();
                var a = new Transform().rotateYTo( v );
                var b = new Transform().rotateYTo([ v.x, v.y, v.z ]);
                assert( v.equals( a.yAxis(), EPSILON ) );
                assert( v.equals( b.yAxis(), EPSILON ) );
            });
        });

        describe('#rotateZTo', function() {
            it('should rotate the transform such that the z-axis aligns with the provided vector', function() {
                var v = Vec3.random().normalize();
                var a = new Transform().rotateZTo( v );
                var b = new Transform().rotateZTo([ v.x, v.y, v.z ]);
                assert( v.equals( a.zAxis(), EPSILON ) );
                assert( v.equals( b.zAxis(), EPSILON ) );
            });
        });

        describe('#scaleMatrix', function() {
            it('should return the scale matrix', function() {
                var scale = Vec3.random();
                var t = new Transform({
                    scale: scale
                });
                var m = Mat44.scale( scale );
                assert( t.scaleMatrix().equals( m, EPSILON ) );
            });
        });

        describe('#rotationMatrix', function() {
            it('should return a rotation matrix', function() {
                var rotation = Quaternion.random();
                var t = new Transform({
                    rotation: rotation
                });
                assert( t.rotationMatrix().equals( rotation.matrix().toMat44(), EPSILON ) );
            });
        });

        describe('#translationMatrix', function() {
            it('should return a translation matrix', function() {
                var translation = Vec3.random();
                var t = new Transform({
                    translation: translation
                });
                var m = Mat44.translation( translation );
                assert( t.translationMatrix().equals( m, EPSILON ) );
            });
        });

        describe('#matrix', function() {
            it('should return the affine transformation matrix', function() {
                var t = Transform.random();
                var m = t.translationMatrix().multMat44( t.rotationMatrix() ).multMat44( t.scaleMatrix() );
                assert( t.matrix().equals( m, EPSILON ) );
            });
        });

        describe('#inverseScaleMatrix', function() {
            it('should return an inverse scale matrix', function() {
                var scale = Vec3.random();
                var t = new Transform({
                    scale: scale
                });
                var m = Mat44.scale( scale );
                assert( t.inverseScaleMatrix().equals( m.inverse(), EPSILON ) );
                assert( m.multMat44( t.inverseScaleMatrix() ).equals( Mat44.identity(), EPSILON ) );
                assert( t.scaleMatrix().multMat44( m.inverse() ).equals( Mat44.identity(), EPSILON ) );
            });
        });

        describe('#inverseRotationMatrix', function() {
            it('should return an inverse rotation matrix', function() {
                var rotation = Quaternion.random();
                var t = new Transform({
                    rotation: rotation
                });
                assert( t.inverseRotationMatrix().equals( rotation.matrix().inverse().toMat44(), EPSILON ) );
                assert( rotation.matrix().toMat44().multMat44( t.inverseRotationMatrix() ).equals( Mat44.identity(), EPSILON ) );
                assert( t.rotationMatrix().multMat44( rotation.matrix().inverse().toMat44() ).equals( Mat44.identity(), EPSILON ) );
            });
        });

        describe('#inverseTranslationMatrix', function() {
            it('should return an inverse translation matrix', function() {
                var translation = Vec3.random();
                var t = new Transform({
                    translation: translation
                });
                var m = Mat44.translation( translation );
                assert( t.inverseTranslationMatrix().equals( m.inverse(), EPSILON ) );
                assert( m.multMat44( t.inverseTranslationMatrix() ).equals( Mat44.identity(), EPSILON ) );
                assert( t.translationMatrix().multMat44( m.inverse() ).equals( Mat44.identity(), EPSILON ) );
            });
        });

        describe('#inverseMatrix', function() {
            it('should return an inverse matrix', function() {
                var t = Transform.random();
                assert( t.inverseMatrix().equals( t.matrix().inverse(), EPSILON ) );
                assert( t.inverseMatrix().multMat44( t.matrix() ).equals( Mat44.identity(), EPSILON ) );
                assert( t.matrix().multMat44( t.inverseMatrix() ).equals( Mat44.identity(), EPSILON ) );
            });
        });

        describe('#viewMatrix()', function() {
            it('should return an view matrix', function() {
                var t = new Transform();
                assert( t.viewMatrix().equals( new Mat44() ) );
            });
        });

        describe('#translateWorld', function() {
            it('should translate origin in world space', function() {
                var translation = Vec3.random();
                var t = new Transform().translateWorld( translation );
                assert( t.translation.equals( translation ) );
            });
            it('should return the transform by reference for chaining', function() {
                var t = Transform.random();
                assert( t === t.translateWorld( Vec3.random() ) );
            });
        });

        describe('#translateLocal', function() {
            it('should translate origin in local space', function() {
                var translationLocal = Vec3.random();
                var a = Transform.random();
                var b = new Transform( a );
                var translationWorld = a.rotationMatrix().multVec3( translationLocal );
                assert( a.translateLocal( translationLocal ).equals( b.translateWorld( translationWorld ), EPSILON ) );
            });
            it('should return the transform by reference for chaining', function() {
                var t = Transform.random();
                assert( t === t.translateLocal([ Math.random(), Math.random(), Math.random() ]) );
            });
        });

        describe('#rotateWorld', function() {
            it('should rotate Transform with an axis specified in world space', function() {
                var t = new Transform();
                var m = t.matrix();
                var axis = Vec3.random();
                var angle = Math.random();
                var a = t.rotateWorld( angle, axis );
                var b = Mat44.rotation( angle, axis );
                assert( b.multMat44( m ).equals( a.matrix(), EPSILON ) );
            });
            it('should return the transform by reference for chaining', function() {
                var t = Transform.random();
                assert( t === t.rotateWorld( Math.random(), Vec3.random() ) );
            });
        });

        describe('#rotateLocal', function() {
            it('should rotate Transform with an axis specified in local space', function() {
                var t = new Transform();
                var m = t.matrix();
                var axis = Vec3.random();
                var angle = Math.random();
                var a = t.rotateLocal( angle, t.rotationMatrix().multVec3( axis ) );
                var b = Mat44.rotation( angle, t.rotationMatrix().multVec3( axis ) );
                assert( b.multMat44( m ).equals( a.matrix(), EPSILON ) );
            });
            it('should return the transform by reference for chaining', function() {
                var t = Transform.random();
                assert( t === t.rotateLocal( Math.random(), Vec3.random() ) );
            });
        });

        describe('#localToWorld', function() {
            it('should transform the vector argument from the transforms local coordinate system to world coordinate system', function() {
                var t = Transform.random();
                var local = Vec3.random();
                var world = t.localToWorld( local );
                assert( world.equals( t.matrix().multVec3( local ), EPSILON ) );
                assert( local.equals( t.worldToLocal( t.localToWorld( local ) ), EPSILON ) );
            });
        });

        describe('#worldToLocal', function() {
            it('should transform the vector from the transforms local coordinate system to world coordinate system', function() {
                var t = Transform.random();
                var world = Vec3.random();
                var local = t.worldToLocal( world );
                assert( local.equals( t.inverseMatrix().multVec3( world ), EPSILON ) );
                assert( world.equals( t.localToWorld( t.worldToLocal( world ) ), EPSILON ) );
            });
        });

        describe('#toString', function() {
            it('should return a string containing the comma separated values of the transforms matrix', function() {
                var t = Transform.random();
                var m = t.matrix();
                var s = t.toString().replace(/\n/g, '');
                var a = s.split(',');

                assert( parseFloat( a[0] ) === m.data[0] );
                assert( parseFloat( a[1] ) === m.data[4] );
                assert( parseFloat( a[2] ) === m.data[8] );
                assert( parseFloat( a[3] ) === m.data[12] );

                assert( parseFloat( a[4] ) === m.data[1] );
                assert( parseFloat( a[5] ) === m.data[5] );
                assert( parseFloat( a[6] ) === m.data[9] );
                assert( parseFloat( a[7] ) === m.data[13] );

                assert( parseFloat( a[8] ) === m.data[2] );
                assert( parseFloat( a[9] ) === m.data[6] );
                assert( parseFloat( a[10] ) === m.data[10] );
                assert( parseFloat( a[11] ) === m.data[14] );

                assert( parseFloat( a[12] ) === m.data[3] );
                assert( parseFloat( a[13] ) === m.data[7] );
                assert( parseFloat( a[14] ) === m.data[11] );
                assert( parseFloat( a[15] ) === m.data[15] );
            });
        });

    });

}());
