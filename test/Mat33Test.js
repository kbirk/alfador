(function() {

    'use strict';

    var assert = require('assert');
    var Mat33 = require('../src/Mat33');
    var Mat44 = require('../src/Mat44');
    var Vec3 = require('../src/Vec3');
    var Vec4 = require('../src/Vec4');
    require('../src/Quaternion');
    var EPSILON = require('../src/Epsilon');

    describe('Mat33', function() {

        describe('#equals()', function() {
            it('should return false if any components do not match', function() {
                var i,
                    a0 = Math.random(), b0 = Math.random(), c0 = Math.random(),
                    a1 = Math.random(), b1 = Math.random(), c1 = Math.random(),
                    a2 = Math.random(), b2 = Math.random(), c2 = Math.random(),
                    p = new Mat33([ a0, a1, a2, b0, b1, b2, c0, c1, c2 ]),
                    q;
                for ( i=0; i<p.data.length; i++ ) {
                    q = new Mat33([ a0, a1, a2, b0, b1, b2, c0, c1, c2 ]);
                    q.data[i] = q.data[i] + 1;
                    assert( !p.equals( q ) );
                }
            });
            it('should return true if all components match', function() {
                var a0 = Math.random(), b0 = Math.random(), c0 = Math.random(),
                    a1 = Math.random(), b1 = Math.random(), c1 = Math.random(),
                    a2 = Math.random(), b2 = Math.random(), c2 = Math.random(),
                    p = new Mat33([ a0, a1, a2, b0, b1, b2, c0, c1, c2 ]),
                    q = new Mat33([ a0, a1, a2, b0, b1, b2, c0, c1, c2 ]);
                assert( p.equals( q ) );
                assert( p.equals( q.data ) );
            });
            it('should accept a second epsilon parameter, return true if each component is <= epsilon', function() {
                var r = Math.random(),
                    m = new Mat33([
                        r, r, r,
                        r, r, r,
                        r, r, r ]);
                assert( m.equals( new Mat33([
                    r/2, r/2, r/2,
                    r/2, r/2, r/2,
                    r/2, r/2, r/2 ]), r/2 ) );
            });
        });

        describe('#random()', function() {
            it('should return a Mat33 with all random components', function() {
                var p = Mat33.random(),
                    q = new Mat33([ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
                assert( !p.equals( q ) );
            });
        });

        describe('#constructor()', function() {
            it('should return a deep copy when supplied another Mat33', function() {
                var p = Mat33.random(),
                    q = new Mat33( p );
                assert( p.equals( q ) );
                assert( p !== q );
            });
            it('should return a Mat33 from an array of length 9', function() {
                var a = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
                    p = new Mat33( a ),
                    q = new Mat33( p );
                assert( p.equals( q ) );
                assert( p.data === a );
            });
            it('should return an identity matrix when given no input', function() {
                var p = new Mat33(),
                    identity = Mat33.identity();
                assert( p.equals( identity ) );
            });
        });

        describe('#row()', function() {
            it('should set the corresponding zero based row to the provided vector', function() {
                var p = Mat33.random();
                var t0 = Vec3.random();
                var t1 = Vec3.random();
                var t2 = Vec3.random();
                assert( p.row(0, t0).row(0).equals( t0 ) );
                assert( p.row(0, t1).row(0).equals( t1 ) );
                assert( p.row(0, t2).row(0).equals( t2 ) );
            });
            it('should return a the corresponding row, by zero based index', function() {
                var p = Mat33.random();
                assert( p.row(0).equals( new Vec3( p.data[0], p.data[3], p.data[6] ) ) );
                assert( p.row(1).equals( new Vec3( p.data[1], p.data[4], p.data[7] ) ) );
                assert( p.row(2).equals( new Vec3( p.data[2], p.data[5], p.data[8] ) ) );
            });
        });

        describe('#col()', function() {
            it('should set the corresponding zero based column to the provided vector', function() {
                var p = Mat33.random();
                var t0 = Vec3.random();
                var t1 = Vec3.random();
                var t2 = Vec3.random();
                assert( p.col(0, t0).col(0).equals( t0 ) );
                assert( p.col(0, t1).col(0).equals( t1 ) );
                assert( p.col(0, t2).col(0).equals( t2 ) );
            });
            it('should return a the corresponding column, by zero based index', function() {
                var p = Mat33.random();
                assert( p.col(0).equals( new Vec3( p.data[0], p.data[1], p.data[2] ) ) );
                assert( p.col(1).equals( new Vec3( p.data[3], p.data[4], p.data[5] ) ) );
                assert( p.col(2).equals( new Vec3( p.data[6], p.data[7], p.data[8] ) ) );
            });
        });

        describe('#addMat33()', function() {
            it('should return a new Mat33 by value', function() {
                var p = Mat33.random(),
                    q = Mat33.random(),
                    r = p.addMat33( q ),
                    s = p.addMat33( q.data );
                assert( r instanceof Mat33 );
                assert( r !== p );
                assert( r.col(0).equals( p.col(0).add( q.col(0) ) ) );
                assert( r.col(1).equals( p.col(1).add( q.col(1) ) ) );
                assert( s.col(2).equals( p.col(2).add( q.col(2) ) ) );
            });
        });

        describe('#addMat44()', function() {
            it('should return a new Mat33 by value', function() {
                var p = Mat33.random(),
                    q = Mat44.random(),
                    r = p.addMat44( q ),
                    s = p.addMat44( q.data );
                assert( r instanceof Mat33 );
                assert( r !== p );
                assert( r.col(0).equals( p.col(0).add( q.col(0) ) ) );
                assert( r.col(1).equals( p.col(1).add( q.col(1) ) ) );
                assert( s.col(2).equals( p.col(2).add( q.col(2) ) ) );
            });
        });

        describe('#subMat33()', function() {
            it('should return a Mat33 when passed a Mat33 argument', function() {
                var p = Mat33.random(),
                    q = Mat33.random(),
                    r = p.subMat33( q ),
                    s = p.subMat33( q.data );
                assert( r instanceof Mat33 );
                assert( r !== p );
                assert( r.col(0).equals( p.col(0).sub( q.col(0) ) ) );
                assert( r.col(1).equals( p.col(1).sub( q.col(1) ) ) );
                assert( s.col(2).equals( p.col(2).sub( q.col(2) ) ) );
            });
        });

        describe('#subMat44()', function() {
            it('should return a Mat33 when passed a Mat44 argument', function() {
                var p = Mat33.random(),
                    q = Mat44.random(),
                    r = p.subMat44( q ),
                    s = p.subMat44( q.data );
                assert( r instanceof Mat33 );
                assert( r !== p );
                assert( r.col(0).equals( p.col(0).sub( q.col(0) ) ) );
                assert( r.col(1).equals( p.col(1).sub( q.col(1) ) ) );
                assert( s.col(2).equals( p.col(2).sub( q.col(2) ) ) );
            });
        });

        describe('#multScalar()', function() {
            it('should return a new Mat33 by value', function() {
                var p = Mat33.random(),
                    q = Math.random(),
                    r = p.multScalar( q );
                assert( r instanceof Mat33 );
                assert( p !== r );
            });
        });

        describe('#multMat33()', function() {
            it('should return a new Mat33 by value', function() {
                var p = Mat33.random(),
                    q = Mat33.random(),
                    r = p.multMat33( q );
                assert( r instanceof Mat33 );
                assert( p !== r );
            });
            it('should accept array as an argument', function() {
                var p = Mat33.random(),
                    q = [
                        Math.random(), Math.random(), Math.random(),
                        Math.random(), Math.random(), Math.random(),
                        Math.random(), Math.random(), Math.random()
                    ],
                    r = p.multMat33( q );
                assert( r instanceof Mat33 );
            });
        });

        describe('#multMat44()', function() {
            it('should return a new Mat33 by value', function() {
                var p = Mat33.random(),
                    q = Mat44.random(),
                    r = p.multMat44( q ),
                    s = p.multMat44( q.data );
                assert( r instanceof Mat33 );
                assert( s instanceof Mat33 );
                assert( p !== r );
            });
            it('should accept array as an argument', function() {
                var p = Mat33.random(),
                    q = [
                        Math.random(), Math.random(), Math.random(), Math.random(),
                        Math.random(), Math.random(), Math.random(), Math.random(),
                        Math.random(), Math.random(), Math.random(), Math.random(),
                        Math.random(), Math.random(), Math.random(), Math.random()
                    ],
                    r = p.multMat33( q );
                assert( r instanceof Mat33 );
            });
        });

        describe('#multVec3()', function() {
            it('should return a new Vec3 by value', function() {
                var p = Mat33.random(),
                    q = Vec3.random(),
                    r = p.multVec3( q ),
                    s = Vec4.random(),
                    t = p.multVec3( s );
                assert( r instanceof Vec3 );
                assert( t instanceof Vec3 );
                assert( p !== r );
                assert( p !== t );
            });
            it('should accept array as an argument', function() {
                var p = Mat33.random(),
                    q = [ Math.random(), Math.random(), Math.random() ],
                    r = p.multVec3( q );
                assert( r instanceof Vec3 );
                assert( r.equals( p.multVec3( new Vec3( q ) ) ) );
            });
        });

        describe('#divScalar()', function() {
            it('should return a Mat33 with each component divided by a scalar', function() {
                var m = Mat33.random(),
                    r = Math.random(),
                    q = m.divScalar( r ), i;
                for ( i=0; i<9; i++ ) {
                    assert( q.data[i] === m.data[i] / r );
                }
            });
        });

        describe('#identity()', function() {
            it('should return an identity matrix', function() {
                var p = Mat33.identity(),
                    q = new Mat33([
                        1, 0, 0,
                        0, 1, 0,
                        0, 0, 1
                    ]);
                assert( p.equals( q ) );
            });
        });

        describe('#scale()', function() {
            it('should return a scale matrix', function() {
                var r = Math.random(),
                    p = Mat33.scale( r ),
                    q = new Mat33([ r, 0, 0, 0, r, 0, 0, 0, r ]);
                assert( p.equals( q ) );
            });
            it('should accept scalar, Vec3, and Array arguments', function() {
                var r = Math.random(),
                    p = Mat33.scale( r ),
                    q = Mat33.scale( new Vec3( r, r, r ) ),
                    s = Mat33.scale([ r, r, r ]);
                assert( p.equals( q ) && p.equals( s )  );
            });
        });

        describe('#rotation()', function() {
            it('should return a rotation matrix, rotating counter-clockwise', function() {
                var up =  new Vec3( 0, 1, 0 ),
                    left = new Vec3( 1, 0, 0 ),
                    right = new Vec3( -1, 0, 0 ),
                    forward = new Vec3( 0, 0, 1 ),
                    up90 = Mat33.rotation( 90 * Math.PI / 180, up ),
                    left90 = Mat33.rotation( -90 * Math.PI / 180, left ),
                    forward90 = Mat33.rotation( 90 * Math.PI / 180, forward ),
                    v0 = up90.multVec3( forward ).normalize(),
                    v1 = left90.multVec3( forward ).normalize(),
                    v2 = forward90.multVec3( up ).normalize();
                assert( v0.equals( left, EPSILON ) );
                assert( v1.equals( up, EPSILON ) );
                assert( v2.equals( right, EPSILON ) );
            });
            it('should throw an exception if given a zero vector as an axis', function() {
                var axis = new Vec3( 0, 0, 0 ),
                    angle = Math.random(),
                    result = false;
                try {
                    Mat33.rotation( angle, axis );
                } catch( err ) {
                    result = true;
                }
                assert( result );
            });
        });

        describe('#rotationFromTo()', function() {
            it('should return a rotation matrix from vector A to B', function() {
                var r = Vec3.random().normalize(),
                    s = Vec3.random().normalize(),
                    rs = Mat33.rotationFromTo( r, s ).multVec3( r ).normalize(),
                    sr = Mat33.rotationFromTo( s, r ).multVec3( s ).normalize(),
                    v = Vec3.random().add( new Vec3( 1, 1, 1) ).normalize(),
                    ca = new Vec3( 0, 1, 1).normalize(),
                    cb = new Vec3( 0, 1, 0 ).normalize(),
                    cc = new Vec3( 1, 0, -1 ).normalize(),
                    cd = new Vec3( 1, 0, 0 ).normalize(),
                    other;
                assert( rs.equals( s, EPSILON ) );
                assert( sr.equals( r, EPSILON ) );

                other = Mat33.rotation( EPSILON, v ).multVec3( ca ).normalize();
                assert( Mat33.rotationFromTo( ca, other ).multVec3( ca ).equals( other, EPSILON ) );

                other = Mat33.rotation( EPSILON, v ).multVec3( cb ).normalize();
                assert( Mat33.rotationFromTo( cb, other ).multVec3( cb ).equals( other, EPSILON ) );

                other = Mat33.rotation( EPSILON, v ).multVec3( cc ).normalize();
                assert( Mat33.rotationFromTo( cc, other ).multVec3( cc ).equals( other, EPSILON ) );

                other = Mat33.rotation( EPSILON, v ).multVec3( cd ).normalize();
                assert( Mat33.rotationFromTo( cd, other ).multVec3( cd ).equals( other, EPSILON ) );
            });
        });

        describe('#transpose()', function() {
            it('should return a transposed copy of the matrix', function() {
                var a = Mat33.random(),
                    b = new Mat33([
                        a.data[0], a.data[3], a.data[6],
                        a.data[1], a.data[4], a.data[7],
                        a.data[2], a.data[5] ,a.data[8] ]);
                assert( a.transpose().equals( b ) );
            });

            it('should return a deep copy', function() {
                var p = Mat33.random(),
                    q = p.transpose();
                assert( p !== q );
            });

            it('should not modify the calling object', function() {
                var p = Mat33.random(),
                    c = new Mat33( p );
                p.transpose();
                assert( p.equals( c ) );
            });
        });

        describe('#inverse()', function() {
            it('should return an inverse copy of the matrix', function() {
                var identity = Mat33.identity(),
                    a = new Mat33().inverse( Vec3.random(), Vec3.random() );
                assert( a.inverse().multMat33( a ).equals( identity ) );
                assert( a.multMat33( a.inverse() ).equals( identity ) );
            });

            it('should return a deep copy', function() {
                var p = Mat33.random(),
                    q = p.inverse();
                assert( p !== q );
            });

            it('should not modify the calling object', function() {
                var p = Mat33.random(),
                    c = new Mat33( p );
                p.inverse();
                assert( p.equals( c ) );
            });
        });

        describe('#scale', function() {
            it('should return the scale matrix', function() {
                var p = Vec3.random(),
                    q = Mat33.scale( p ).scale(),
                    r = Mat33.scale( p );
                assert( q.equals( r, EPSILON ) );
            });
        });

        describe('#rotation', function() {
            it('should return the rotation matrix', function() {
                var p = Vec3.random(),
                    q = Mat33.rotationFromTo( new Vec3( 0, 0, 1 ), p ),
                    r = q.rotation();
                assert( q.equals( r, EPSILON ) );
            });
        });

        describe('#inverseScale', function() {
            it('should return the inverse scale matrix', function() {
                var s = Vec3.random(),
                    p = Mat33.scale( s ),
                    q = Mat33.scale( s ).inverse(),
                    r = p.inverseScale();
                assert( r.equals( q, EPSILON ) );
                assert( r.multMat33( p.scale() ).equals( Mat33.identity(), EPSILON ) );
                assert( p.scale().multMat33( q ).equals( Mat33.identity(), EPSILON ) );
            });
        });

        describe('#inverseRotation', function() {
            it('should return the inverse rotation matrix', function() {
                var p = Vec3.random(),
                    q = Mat33.rotationFromTo( new Vec3( 0, 0, 1 ), p ),
                    r = q.inverseRotation(),
                    s = q.inverse();
                assert( r.equals( s, EPSILON ) );
                assert( r.multMat33( q.rotation() ).equals( Mat33.identity(), EPSILON ) );
                assert( q.rotation().multMat33( s ).equals( Mat33.identity(), EPSILON ) );
            });
        });

        describe('#decompose', function() {
            it('should return the rotation and scale of the matrix', function() {
                var t, m, i;
                for ( i=0; i<36; i++ ) {
                    m = Mat33.random();
                    t = m.decompose();
                    assert( t.rotation.matrix().equals( m.rotation(), EPSILON ) );
                    assert( Mat33.scale( t.scale ).equals( m.scale(), EPSILON ) );
                }
            });
        });

        describe('#toString', function() {
            it('should return a string containing the comma separated values of the transforms matrix', function() {
                var m = Mat33.random(),
                    s = m.toString().replace(/\n/g, ''),
                    a = s.split(',');

                assert( parseFloat( a[0] ) === m.data[0] );
                assert( parseFloat( a[1] ) === m.data[3] );
                assert( parseFloat( a[2] ) === m.data[6] );

                assert( parseFloat( a[3] ) === m.data[1] );
                assert( parseFloat( a[4] ) === m.data[4] );
                assert( parseFloat( a[5] ) === m.data[7] );

                assert( parseFloat( a[6] ) === m.data[2] );
                assert( parseFloat( a[7] ) === m.data[5] );
                assert( parseFloat( a[8] ) === m.data[8] );
            });
        });

        describe('#toArray', function() {
            it('should return an Array with nine matching components', function() {
                var m = Mat33.random(),
                    a = m.toArray(),
                    i;
                assert( a instanceof Array );
                assert( a.length === 9 );
                for ( i=0; i<9; i++ ) {
                    assert( a[i] - m.data[i] < EPSILON );
                }
            });
        });

        describe('#toMat44', function() {
            it('should return the expanded Mat44 equivolent with no translation', function() {
                var n = Mat33.random();
                var m = n.toMat44();

                assert( m.data[0] === n.data[0] );
                assert( m.data[1] === n.data[1] );
                assert( m.data[2] === n.data[2] );
                assert( m.data[3] === 0 );

                assert( m.data[4] === n.data[3] );
                assert( m.data[5] === n.data[4] );
                assert( m.data[6] === n.data[5] );
                assert( m.data[7] === 0 );

                assert( m.data[8] === n.data[6] );
                assert( m.data[9] === n.data[7] );
                assert( m.data[10] === n.data[8] );
                assert( m.data[11] === 0 );

                assert( m.data[12] === 0 );
                assert( m.data[13] === 0 );
                assert( m.data[14] === 0 );
                assert( m.data[15] === 1 );
            });
        });

    });

}());
