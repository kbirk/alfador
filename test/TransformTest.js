(function() {

    'use strict';

    var assert = require('assert');
    var Mat33 = require('../src/Mat33');
    var Mat44 = require('../src/Mat44');
    var Vec3 = require('../src/Vec3');
    var Transform = require('../src/Transform');
    var EPSILON = require('../src/Epsilon');

    describe('Transform', function() {

        describe('#equals()', function() {
            it('should return false if any components do not match', function() {
                var m = Mat44.random(),
                    t = new Transform( m ),
                    q, i;
                for ( i=0; i<m.data.length; i++ ) {
                    if ( i === 3 || i === 7 || i === 11 || i === 15 ) {
                        continue;
                    }
                    q = new Mat44( m );
                    q.data[i] = q.data[i] + 1;
                    assert.equal( t.equals( new Transform( q ) ), false );
                }
            });
            it('should return true if all components match', function() {
                var m = Mat44.random(),
                    p = new Transform( m ),
                    q = new Transform( m );
                assert.equal( p.equals( q ), true );
            });
            it('should accept a second epsilon parameter, return true if each component is <= epsilon', function() {
                var m = Mat44.random(),
                    p = new Transform( m ),
                    q = new Transform( m );
                q.rotateWorldDegrees( 0.1, new Vec3( 0, 1, 0 ) );
                assert.equal( p.equals( q, 1.0 ), true );
            });
        });

        describe('#constructor()', function() {
            it('should return an identity Transform when no, or improper arguments are provided', function() {
                var t = new Transform(),
                    u = new Transform( 'improper' ),
                    v = new Transform( 4, new Vec3() );
                assert.equal( t.forward().equals( new Vec3( 0, 0, 1 ) ), true );
                assert.equal( t.left().equals( new Vec3( 1, 0, 0 ) ), true );
                assert.equal( t.up().equals( new Vec3( 0, 1, 0 ) ), true );
                assert.equal( t.origin().equals( new Vec3( 0, 0, 0 ) ), true );
                assert.equal( t.scale().equals( new Vec3( 1, 1, 1) ), true );
                assert.equal( t.matrix().equals( Mat44.identity() ), true );
                assert.equal( u.matrix().equals( Mat44.identity() ), true );
                assert.equal( v.matrix().equals( Mat44.identity() ), true );
            });
            it('should return a deep copy Transform when a single Transform argument is provided', function() {
                var t = Transform.random(),
                    s = new Transform( t );
                assert.equal( t.forward().equals( s.forward() ), true );
                assert.equal( t.left().equals( s.left() ), true );
                assert.equal( t.up().equals( s.up() ), true );
                assert.equal( t.origin().equals( s.origin() ), true );
                assert.equal( t.scale().equals( s.scale() ), true );
                assert.equal( t !== s, true );
            });
            it('should construct a Transform using up, forward, and origin vector arguments, defaulting scale to 1', function() {
                var p = Vec3.random().normalize(),
                    q = Vec3.random().cross( p ).normalize(),
                    r = Vec3.random(),
                    t = new Transform({
                        up: p,
                        forward: q,
                        origin: r
                    });
                assert.equal( t.up().equals( p, EPSILON ), true );
                assert.equal( t.forward().equals( q, EPSILON ), true );
                assert.equal( t.origin().equals( r ), true );
                assert.equal( t.scale().equals( new Vec3( 1, 1, 1) ), true );
            });
            it('should construct a Transform using up, forward, origin, and scale arguments', function() {
                var p = Vec3.random().normalize(),
                    q = Vec3.random().cross( p ).normalize(),
                    r = Vec3.random(),
                    s = Vec3.random(),
                    t = new Transform({
                        up: p,
                        forward: q,
                        origin: r,
                        scale: s
                    });
                assert.equal( t.up().equals( p, EPSILON ), true );
                assert.equal( t.forward().equals( q, EPSILON ), true );
                assert.equal( t.origin().equals( r ), true );
                assert.equal( t.scale().equals( s ), true );
            });
            it('should construct a Transform from corresponding affine transformation matrix components', function() {
                var t = Transform.random(),
                    u = new Transform( t.matrix() );
                assert.equal( t.up().equals( u.up(), EPSILON ), true );
                assert.equal( t.forward().equals( u.forward(), EPSILON ), true );
                assert.equal( t.origin().equals( u.origin(), EPSILON ), true );
                assert.equal( t.scale().equals( u.scale(), EPSILON ), true );
            });
        });

        describe('#random()', function() {
            it('should return a Transform with all random components', function() {
                var p = Transform.random(),
                    q = Transform.identity();
                assert.equal( p.matrix().equals( q.matrix() ), false );
            });
            it('should return a Transform that is orthogonal', function() {
                var p = Transform.random();
                assert.equal( p.up().dot( p.forward() ) < EPSILON, true );
            });
        });

        describe('#identity', function() {
            it('should return a identity Transform', function() {
                var t = Transform.identity();
                assert.equal( t.forward().equals( new Vec3( 0, 0, 1 ) ), true );
                assert.equal( t.left().equals( new Vec3( 1, 0, 0 ) ), true );
                assert.equal( t.up().equals( new Vec3( 0, 1, 0 ) ), true );
                assert.equal( t.scale().equals( new Vec3( 1, 1, 1) ), true );
            });
        });

        describe('#origin', function() {
            it('should, when called with no argument, return the origin by value', function() {
                var o = Vec3.random(),
                    p = new Transform().origin( o );
                assert.equal( o.equals( p.origin() ), true );
                assert.equal( o !== p.origin(), true );
            });
            it('should, when called with an argument, return the Transform with the specified origin', function() {
                var p = new Transform().origin( Vec3.random() ),
                    q = p.origin();
                assert.equal( q.equals( p.origin() ), true );
            });
        });

        describe('#forward', function() {
            it('should, when called with no argument, return the forward vector by value', function() {
                var f = Vec3.random().normalize(),
                    p = new Transform().forward( f );
                assert.equal( f.equals( p.forward(), EPSILON ), true );
                assert.equal( f !== p.forward(), true );
            });
            it('should, when called with an argument, return the Transform with the specified forward', function() {
                var v = Vec3.random().normalize(),
                    p = new Transform().forward( v ),
                    q = new Transform().forward([ v.x, v.y, v.z ]);
                assert.equal( v.equals( p.forward(), EPSILON ), true );
                assert.equal( v.equals( q.forward(), EPSILON ), true );
            });
            it('should ensure orthogonality of Transform axes', function() {
                var p = new Transform(),
                    q = p.forward( Vec3.random() );
                assert.equal( q.forward().dot( q.up() ) < EPSILON, true );
                assert.equal( q.forward().dot( q.left() ) < EPSILON, true );
            });
        });

        describe('#up', function() {
            it('should, when called with no argument, return the up vector by value', function() {
                var u = Vec3.random().normalize(),
                    p = new Transform().up( u );
                assert.equal( u.equals( p.up(), EPSILON ), true );
                assert.equal( u !== p.up(), true );
            });
            it('should, when called with an argument, return the Transform with the specified up', function() {
                var v = Vec3.random().normalize(),
                    p = new Transform().up( v ),
                    q = new Transform().up([ v.x, v.y, v.z ]);
                assert.equal( v.equals( p.up(), EPSILON ), true );
                assert.equal( v.equals( q.up(), EPSILON ), true );
            });
            it('should ensure orthogonality of Transform axes', function() {
                var p = new Transform(),
                    q = p.up( Vec3.random() );
                assert.equal( q.up().dot( q.forward() ) < EPSILON, true );
                assert.equal( q.up().dot( q.left() ) < EPSILON, true );
            });
        });

        describe('#left', function() {
            it('should, when called with no argument, return the left vector by value', function() {
                var l = Vec3.random().normalize(),
                    p = new Transform().left( l );
                assert.equal( l.equals( p.left(), EPSILON ), true );
                assert.equal( l !== p.left(), true );
            });
            it('should, when called with an argument, return the Transform with the specified left', function() {
                var v = Vec3.random().normalize(),
                    p = new Transform().left( v ),
                    q = new Transform().left([ v.x, v.y, v.z ]);
                assert.equal( v.equals( p.left(), EPSILON ), true );
                assert.equal( v.equals( q.left(), EPSILON ), true );
            });
            it('should ensure orthogonality of Transform axes', function() {
                var p = new Transform(),
                    q = p.left( Vec3.random() );
                assert.equal( q.left().dot( q.forward() ) < EPSILON, true );
                assert.equal( q.left().dot( q.up() ) < EPSILON, true );
            });
        });

        describe('#scale', function() {
            it('should, when called with no argument, return the scale by value', function() {
                var s = Vec3.random(),
                    p = new Transform().scale( s );
                assert.equal( s.equals( p.scale() ), true );
                assert.equal( s !== p.left(), true );
            });
            it('should, when called with an argument, return the Transform with the specified scale', function() {
                var r = Vec3.random(),
                    p = new Transform().scale( r ),
                    q = p.scale();
                assert.equal( q.equals( r ), true );
            });
            it('should accept both scalar and vec3 arguments', function() {
                var r = Math.random(),
                    q = new Transform().scale( r ),
                    p = new Transform().scale( new Vec3( r, r, r ) );
                assert.equal( q.scale().equals( p.scale() ), true );
            });
        });

        describe('#mult', function() {
            it('should return a transform that represents the product of the multiplication', function() {
                var a = new Transform( Mat44.random() ),
                    b = new Transform( Mat44.random() ),
                    q = a.mult( b );
                assert.equal( q.matrix().equals( a.matrix().mult( b.matrix() ), EPSILON ), true );
            });
            it('should accept Mat33, Mat44, and Transform instances as an argument', function() {
                var a = new Transform( Mat44.random() ),
                    b = Mat33.random(),
                    c = new Transform( b ),
                    d = new Mat44( b );
                assert( a.mult( b ).equals( a.mult( c ), EPSILON ) );
                assert( a.mult( c ).equals( a.mult( d ), EPSILON ) );
            });
            it('should return by value', function() {
                var a = new Transform( Mat44.random() ),
                    b = new Transform( Mat44.random() ),
                    q = a.mult( b ),
                    r = a.mult( b );
                assert.equal( r !== q, true );
            });
        });

        describe('#scaleMatrix', function() {
            it('should return a scale matrix', function() {
                var p = Vec3.random(),
                    q = new Transform().scale( p ).scaleMatrix(),
                    r = Mat44.scale( p );
                assert.equal( q.equals( r, EPSILON ), true );
            });
            it('should return by value', function() {
                var p = new Transform().origin( Vec3.random() ),
                    q = p.scaleMatrix(),
                    r = p.scaleMatrix();
                assert.equal( r !== q, true );
            });
        });

        describe('#rotationMatrix', function() {
            it('should return a rotation matrix', function() {
                var p = Vec3.random(),
                    q = new Transform().forward( p ),
                    r = q.rotationMatrix(),
                    s = Mat44.rotationFromTo( new Vec3( 0, 0, 1 ), p );
                assert.equal( s.equals( r, EPSILON ), true );
            });
            it('should return by value', function() {
                var p = new Transform().origin( Vec3.random() ),
                    q = p.rotationMatrix(),
                    r = p.rotationMatrix();
                assert.equal( r !== q, true );
            });
        });

        describe('#translationMatrix', function() {
            it('should return a translation matrix', function() {
                var p = new Transform().origin( Vec3.random() ),
                    q = Mat44.translation( p.origin() );
                assert.equal( q.equals( p.translationMatrix(), EPSILON ), true );
            });
            it('should return by value', function() {
                var p = new Transform().origin( Vec3.random() ),
                    q = p.translationMatrix(),
                    r = p.translationMatrix();
                assert.equal( r !== q, true );
            });
        });

        describe('#matrix', function() {
            it('should return the affine Transform matrix', function() {
                var p = Transform.random();
                assert.equal( p.matrix().equals( p.translationMatrix().mult( p.rotationMatrix() ).mult( p.scaleMatrix() ), EPSILON ), true );
            });
            it('should return by value', function() {
                var p = new Transform().origin( Vec3.random() ).forward( Vec3.random() ),
                    q = p.matrix(),
                    r = p.matrix();
                assert.equal( r !== q, true );
            });
        });

        describe('#inverseScaleMatrix', function() {
            it('should return an inverse scale matrix', function() {
                var s = Vec3.random(),
                    p = new Transform().scale( s ),
                    q = Mat44.scale( s ).inverse(),
                    r = p.inverseScaleMatrix();
                assert.equal( r.equals( q, EPSILON ), true );
                assert.equal( r.mult( p.scaleMatrix() ).equals( Mat44.identity(), EPSILON ), true );
                assert.equal( p.scaleMatrix().mult( q ).equals( Mat44.identity(), EPSILON ), true );
            });
            it('should return by value', function() {
                var p = new Transform().scale( Math.random() ),
                    q = p.inverseScaleMatrix(),
                    r = p.inverseScaleMatrix();
                assert.equal( r !== q, true );
            });
        });

        describe('#inverseRotationMatrix', function() {
            it('should return an inverse rotation matrix', function() {
                var p = Vec3.random(),
                    q = new Transform().forward( p ),
                    r = q.inverseRotationMatrix(),
                    s = Mat44.rotationFromTo( new Vec3( 0, 0, 1 ), p ).inverse();
                assert.equal( s.equals( r, EPSILON ), true );
                assert.equal( s.mult( q.rotationMatrix() ).equals( Mat44.identity(), EPSILON ), true );
                assert.equal( q.rotationMatrix().mult( s ).equals( Mat44.identity(), EPSILON ), true );
            });
            it('should return by value', function() {
                var p = new Transform().forward( Vec3.random() ),
                    q = p.inverseRotationMatrix(),
                    r = p.inverseRotationMatrix();
                assert.equal( r !== q, true );
            });
        });

        describe('#inverseTranslationMatrix', function() {
            it('should return an inverse translation matrix', function() {
                var p = new Transform().origin( Vec3.random() ),
                    q = Mat44.translation( p.origin() ).inverse(),
                    r = p.inverseTranslationMatrix();
                assert.equal( q.equals( r, EPSILON ), true );
                assert.equal( q.mult( p.translationMatrix() ).equals( Mat44.identity(), EPSILON ), true );
                assert.equal( p.translationMatrix().mult( q ).equals( Mat44.identity(), EPSILON ), true );
            });
            it('should return by value', function() {
                var p = new Transform().origin( Vec3.random() ),
                    q = p.inverseTranslationMatrix(),
                    r = p.inverseTranslationMatrix();
                assert.equal( r !== q, true );
            });
        });

        describe('#inverseMatrix', function() {
            it('should return an inverse matrix', function() {
                var p = new Transform().origin( Vec3.random() ).forward( Vec3.random() );
                assert.equal( p.inverseMatrix().equals( p.matrix().inverse(), EPSILON ), true );
                assert.equal( p.inverseMatrix().mult( p.matrix() ).equals( Mat44.identity(), EPSILON ), true );
            });
            it('should return by value', function() {
                var p = new Transform().origin( Vec3.random() ).forward( Vec3.random() ),
                    q = p.inverseMatrix(),
                    r = p.inverseMatrix();
                assert.equal( r !== q, true );
            });
        });

        describe('#viewMatrix()', function() {
            it('should return an view matrix', function() {
                var t = new Transform({
                        up: new Vec3( 0, 1, 0 ),
                        forward: new Vec3( 0, 0, -1 ),
                        left: new Vec3( -1, 0, 0 ),
                        origin: new Vec3( 0, 0, 0 )
                    });
                assert.equal( t.viewMatrix().equals( new Mat44() ), true );
                assert.equal( new Transform().viewMatrix().equals(
                    new Mat44([ -1, 0, 0, 0,
                                 0, 1, 0, 0,
                                 0, 0, -1, 0,
                                 0, 0, 0, 1 ]) ), true );
            });
        });

        describe('#translateWorld', function() {
            it('should translate origin in world space', function() {
                var r = Vec3.random(),
                    p = new Transform().translateWorld( r );
                assert.equal( p.origin().equals( r ), true );
            });
            it('should return the transform by reference for chaining', function() {
                var p = Transform.random(),
                    q = p.translateWorld( Vec3.random() );
                assert.equal( p === q, true );
            });
        });

        describe('#translateLocal', function() {
            it('should translate origin in world space', function() {
                var r = Vec3.random(),
                    p = Transform.random(),
                    s = p.origin(),
                    q = p.translateLocal( r.normalize() ).origin(),
                    t = s.add( p.rotationMatrix().mult( r ).normalize() );
                assert.equal( q.equals( t, EPSILON ), true );
            });
            it('should return the transform by reference for chaining', function() {
                var p = Transform.random(),
                    q = p.translateLocal( [ Math.random(), Math.random(), Math.random() ] );
                assert.equal( p === q, true );
            });
        });

        describe('#rotateWorldDegrees', function() {
            it('should rotate the Transform with an axis specified in world space', function() {
                var p = new Transform(),
                    q = p.matrix(),
                    r = Vec3.random(),
                    s = Math.random(),
                    t = p.rotateWorldDegrees( s, r ),
                    u = Mat44.rotationDegrees( s, r );
                assert.equal( u.mult( q ).equals( t.matrix(), EPSILON ), true );
            });
            it('should return the transform by reference for chaining', function() {
                var p = Transform.random(),
                    q = p.rotateWorldDegrees( Math.random(), Vec3.random() );
                assert.equal( p === q, true );
            });
        });

        describe('#rotateWorldRadians', function() {
            it('should rotate Transform with an axis specified in world space', function() {
                var p = new Transform(),
                    q = p.matrix(),
                    r = Vec3.random(),
                    s = Math.random(),
                    t = p.rotateWorldRadians( s * Math.PI / 180, r ),
                    u = Mat44.rotationRadians( s * Math.PI / 180, r );
                assert.equal( u.mult( q ).equals( t.matrix(), EPSILON ), true );
            });
            it('should return the transform by reference for chaining', function() {
                var p = Transform.random(),
                    q = p.rotateWorldRadians( Math.random(), Vec3.random() );
                assert.equal( p === q, true );
            });
        });

        describe('#rotateLocalDegrees', function() {
            it('should rotate Transform with an axis specified in local space', function() {
                var p = new Transform(),
                    q = p.matrix(),
                    r = Vec3.random(),
                    s = Math.random(),
                    t = p.rotateLocalDegrees( s, p.rotationMatrix().mult( r ) ),
                    u = Mat44.rotationDegrees( s, p.rotationMatrix().mult( r ) );
                assert.equal( u.mult( q ).equals( t.matrix(), EPSILON ), true );
            });
            it('should return the transform by reference for chaining', function() {
                var p = Transform.random(),
                    q = p.rotateLocalDegrees( Math.random(), Vec3.random() );
                assert.equal( p === q, true );
            });
        });

        describe('#rotateLocalRadians', function() {
            it('should rotate Transform with an axis specified in local space', function() {
                var p = new Transform(),
                    q = p.matrix(),
                    r = Vec3.random(),
                    s = Math.random(),
                    t = p.rotateLocalRadians( s * Math.PI / 180, p.rotationMatrix().mult( r ) ),
                    u = Mat44.rotationRadians( s * Math.PI / 180, p.rotationMatrix().mult( r ) );
                assert.equal( u.mult( q ).equals( t.matrix(), EPSILON ), true );
            });
            it('should return the transform by reference for chaining', function() {
                var p = Transform.random(),
                    q = p.rotateLocalRadians( Math.random(), Vec3.random() );
                assert.equal( p === q, true );
            });
        });

        describe('#localToWorld', function() {
            it('should convert and return vector argument from Transforms local coordinate system to world coordinate system', function() {
                var p = Transform.random(),
                    q = Vec3.random(),
                    r = p.localToWorld( q );
                assert.equal( r.equals( p.matrix().mult( q ), EPSILON ), true );
            });
            it('should ignore scale if second argument is true', function() {
                var p = new Transform().scale( Math.random() ),
                    q = Vec3.random(),
                    r = p.localToWorld( q, true );
                assert.equal( q.equals( r, EPSILON ), true );
            });
            it('should ignore rotation if third argument is true', function() {
                var p = new Transform().forward( Vec3.random() ),
                    q = Vec3.random(),
                    r = p.localToWorld( q, false, true );
                assert.equal( q.equals( r, EPSILON ), true );
            });
            it('should ignore translation if fourth argument is true', function() {
                var p = new Transform().origin( Vec3.random() ),
                    q = Vec3.random(),
                    r = p.localToWorld( q, false, false, true );
                assert.equal( q.equals( r, EPSILON ), true );
            });
            it('should not modify calling object', function() {
                var p = Transform.random(),
                    q = new Transform( p );
                p.localToWorld( Vec3.random() );
                assert.equal( q.matrix().equals( p.matrix(), EPSILON ), true );
            });
        });

        describe('#worldToLocal', function() {
            it('should convert and return vector argument from Transforms local coordinate system to world coordinate system', function() {
                var p = Transform.random(),
                    q = Vec3.random(),
                    r = p.worldToLocal( q );
                assert.equal( r.equals( p.inverseMatrix().mult( q ), EPSILON ), true );
            });
            it('should ignore scale if second argument is true', function() {
                var p = new Transform().scale( Vec3.random() ),
                    q = Vec3.random(),
                    r = p.worldToLocal( q, true );
                assert.equal( q.equals( r, EPSILON ), true );
            });
            it('should ignore rotation if third argument is true', function() {
                var p = new Transform().forward( Vec3.random() ),
                    q = Vec3.random(),
                    r = p.worldToLocal( q, false, true );
                assert.equal( q.equals( r, EPSILON ), true );
            });
            it('should ignore translation if fourth argument is true', function() {
                var p = new Transform().origin( Vec3.random() ),
                    q = Vec3.random(),
                    r = p.worldToLocal( q, false, false, true );
                assert.equal( q.equals( r, EPSILON ), true );
            });
            it('should not modify calling object', function() {
                var p = Transform.random(),
                    q = new Transform( p );
                p.worldToLocal( Vec3.random() );
                assert.equal( q.matrix().equals( p.matrix(), EPSILON ), true );
            });
        });

        describe('#toString', function() {
            it('should return a string containing the comma separated values of the transforms matrix', function() {
                var t = Transform.random(),
                    m = t.matrix(),
                    s = t.toString().replace(/\n/g, ''),
                    a = s.split(',');

                assert.equal( parseFloat( a[0] ) === m.data[0], true );
                assert.equal( parseFloat( a[1] ) === m.data[4], true );
                assert.equal( parseFloat( a[2] ) === m.data[8], true );
                assert.equal( parseFloat( a[3] ) === m.data[12], true );

                assert.equal( parseFloat( a[4] ) === m.data[1], true );
                assert.equal( parseFloat( a[5] ) === m.data[5], true );
                assert.equal( parseFloat( a[6] ) === m.data[9], true );
                assert.equal( parseFloat( a[7] ) === m.data[13], true );

                assert.equal( parseFloat( a[8] ) === m.data[2], true );
                assert.equal( parseFloat( a[9] ) === m.data[6], true );
                assert.equal( parseFloat( a[10] ) === m.data[10], true );
                assert.equal( parseFloat( a[11] ) === m.data[14], true );

                assert.equal( parseFloat( a[12] ) === m.data[3], true );
                assert.equal( parseFloat( a[13] ) === m.data[7], true );
                assert.equal( parseFloat( a[14] ) === m.data[11], true );
                assert.equal( parseFloat( a[15] ) === m.data[15], true );
            });
        });

    });

}());
