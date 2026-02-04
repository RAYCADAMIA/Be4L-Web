
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, useTexture, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Helper to create a centered rounded rectangle shape
const createRoundedRectShape = (width: number, height: number, radius: number) => {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;

    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + height - radius);
    shape.quadraticCurveTo(x, y + height, x + radius, y + height);
    shape.lineTo(x + width - radius, y + height);
    shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    shape.lineTo(x + width, y + radius);
    shape.quadraticCurveTo(x + width, y, x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);

    return shape;
};

const Phone = ({ position, texturePath, scale = 1 }: { position: [number, number, number], texturePath: string, scale?: number }) => {
    const texture = useTexture(texturePath);

    // Optimize texture
    texture.anisotropy = 16;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Dimensions
    const screenWidth = 2.35;
    const screenHeight = 4.85;
    const screenRadius = 0.25;

    // Memoize the screen geometry and fixed UVs
    const screenGeometry = React.useMemo(() => {
        const shape = createRoundedRectShape(screenWidth, screenHeight, screenRadius);
        const geo = new THREE.ShapeGeometry(shape);

        // Standard UV mapping
        const posAttribute = geo.attributes.position;
        const uvAttribute = geo.attributes.uv;

        for (let i = 0; i < posAttribute.count; i++) {
            const x = posAttribute.getX(i);
            const y = posAttribute.getY(i);

            // Map UVs with a slight "contain" logic to prevent extreme stretching
            // if the texture isn't exactly the right aspect ratio.
            const u = (x + screenWidth / 2) / screenWidth;
            const v = (y + screenHeight / 2) / screenHeight;
            uvAttribute.setXY(i, u, v);
        }

        return geo;
    }, [screenWidth, screenHeight, screenRadius]);

    // Memoize the bezel geometry
    const bezelGeometry = React.useMemo(() => {
        const shape = createRoundedRectShape(2.4, 4.9, 0.28);
        return new THREE.ShapeGeometry(shape);
    }, []);

    // Clean up geometries on unmount
    React.useEffect(() => {
        return () => {
            screenGeometry.dispose();
            bezelGeometry.dispose();
        };
    }, [screenGeometry, bezelGeometry]);

    return (
        <group position={position} rotation={[0, 0, 0]} scale={scale}>
            {/* Phone Body - Metallic Frame */}
            <RoundedBox args={[2.55, 5.05, 0.3]} radius={0.35} smoothness={8}>
                <meshStandardMaterial
                    color="#0f0f12"
                    roughness={0.15}
                    metalness={0.95}
                    envMapIntensity={1.2}
                />
            </RoundedBox>

            {/* Screen Content (Emissive & Bright) */}
            <mesh position={[0, 0, 0.16]} geometry={screenGeometry}>
                <meshBasicMaterial
                    map={texture}
                    toneMapped={false}
                    color="#ffffff"
                />
            </mesh>

            {/* Inner Dark Border (Bezel) for depth */}
            <mesh position={[0, 0, 0.155]} geometry={bezelGeometry}>
                <meshBasicMaterial color="#000000" />
            </mesh>

            {/* Premium Glass Overlay */}
            <mesh position={[0, 0, 0.17]} geometry={screenGeometry}>
                <meshPhysicalMaterial
                    roughness={0.0}
                    metalness={0.0}
                    transmission={0.99}
                    opacity={0}
                    transparent={true}
                    clearcoat={1.0}
                    clearcoatRoughness={0.0}
                    ior={1.5}
                    envMapIntensity={1.5}
                    color="#ffffff"
                    toneMapped={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

const RotatingPhoneCarousel = ({ isPaused }: { isPaused: boolean }) => {
    const { viewport } = useThree();
    const isMobile = viewport.width < 10;

    // Track current angle
    const angleRef = useRef(0);
    const phoneRefs = useRef<THREE.Group[]>([]);

    // Adjust radius and scale based on viewport - Optimized for clarity
    const radius = isMobile ? 1.4 : 3.8; // Further reduced to prevent overlapping
    const basePhoneScale = isMobile ? 0.8 : 1.35; // Reduced from 1.65 to 1.35 to avoid massive overlapping

    // Use a group for positioning, but update children positions manually
    useFrame((state, delta) => {
        if (!isPaused) {
            angleRef.current += delta * 0.215; // Increased speed by ~29%
        }

        // Update each phone's position to orbit while facing front
        phoneRefs.current.forEach((ref, index) => {
            if (ref) {
                // Calculate angle for this specific phone
                const offset = index * ((Math.PI * 2) / 3);
                const currentAngle = angleRef.current + offset;

                // Orbit logic (standard circular motion)
                // Use a wider oval to separate them horizontally
                ref.position.x = Math.sin(currentAngle) * radius;
                ref.position.z = Math.cos(currentAngle) * (radius * 0.45) - 1.0;

                // Dynamic Scaling: Larger at front (cos(angle) ~ 1), smaller at back
                // Normalize cos value from [-1, 1] to [0, 1] for smoother lerp
                const depthFactor = (Math.cos(currentAngle) + 1) / 2;
                // Scale ranges from 0.7x to 1.3x of base scale
                const dynamicScale = basePhoneScale * (0.8 + 0.4 * depthFactor);

                ref.scale.setScalar(dynamicScale);

                // Add slight tilt based on X position for dynamic feel
                ref.rotation.y = Math.sin(currentAngle) * 0.1;
            }
        });
    });

    const phones = [
        '/assets/screens/quest_screen.png',
        '/assets/screens/echo_screen.png',
        '/assets/screens/dibs_screen.png'
    ];

    return (
        <group position={[0, -0.5, 0]}>
            {phones.map((texture, index) => (
                <group
                    key={index}
                    ref={(el) => { if (el) phoneRefs.current[index] = el; }}
                >
                    <Phone
                        position={[0, 0, 0]} // Initial position overrides by useFrame
                        texturePath={texture}
                        scale={basePhoneScale}
                    />
                </group>
            ))}
        </group>
    );
};

// Safe Environment component to catch load errors
const SafeEnvironment = () => {
    return (
        <Suspense fallback={null}>
            <Environment preset="city" />
        </Suspense>
    );
};

const SceneContent = ({ isPaused }: { isPaused: boolean }) => {
    return (
        <>
            <RotatingPhoneCarousel isPaused={isPaused} />

            {/* Clean Environment & Lighting with Fallback */}
            <SafeEnvironment />

            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
            <pointLight position={[0, 3, 0]} intensity={0.5} color="#2dd4bf" />

            {/* Subtle ground shadow */}
            <ContactShadows
                position={[0, -3, 0]}
                opacity={0.3}
                scale={20}
                blur={2}
                far={4}
            />
        </>
    );
};

export const Hero3DScene = ({ isPaused = false }: { isPaused?: boolean }) => {
    return (
        <div className="w-full h-full absolute inset-0 z-0">
            <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0, 16], fov: 32 }} // Pushed camera even further and narrowed FOV for more cinematic perspective
                gl={{ antialias: true, alpha: true }}
            >
                <Suspense fallback={null}>
                    <SceneContent isPaused={isPaused} />
                </Suspense>
            </Canvas>
        </div>
    );
};
