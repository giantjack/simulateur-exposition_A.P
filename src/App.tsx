import { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Select,
  VStack,
  HStack,
  Badge,
  Tooltip,
} from "@chakra-ui/react";

// Valeurs d'ouverture courantes
const APERTURES = [1.4, 1.8, 2, 2.8, 4, 5.6, 8, 11, 16, 22];

// Vitesses d'obturation (en secondes)
const SHUTTER_SPEEDS = [
  { value: 1 / 4000, label: "1/4000" },
  { value: 1 / 2000, label: "1/2000" },
  { value: 1 / 1000, label: "1/1000" },
  { value: 1 / 500, label: "1/500" },
  { value: 1 / 250, label: "1/250" },
  { value: 1 / 125, label: "1/125" },
  { value: 1 / 60, label: "1/60" },
  { value: 1 / 30, label: "1/30" },
  { value: 1 / 15, label: "1/15" },
  { value: 1 / 8, label: "1/8" },
  { value: 1 / 4, label: "1/4" },
  { value: 1 / 2, label: "1/2" },
  { value: 1, label: "1s" },
  { value: 2, label: "2s" },
  { value: 4, label: "4s" },
];

// Valeurs ISO courantes
const ISO_VALUES = [100, 200, 400, 800, 1600, 3200, 6400, 12800];

// Scènes avec leur EV de référence
const SCENES = [
  { name: "Plein soleil", ev: 15, icon: "☀️" },
  { name: "Légèrement nuageux", ev: 14, icon: "🌤️" },
  { name: "Nuageux", ev: 13, icon: "☁️" },
  { name: "Ombre / Couvert", ev: 12, icon: "🌥️" },
  { name: "Intérieur bien éclairé", ev: 9, icon: "🏠" },
  { name: "Intérieur normal", ev: 7, icon: "💡" },
  { name: "Intérieur sombre", ev: 5, icon: "🌙" },
  { name: "Nuit urbaine", ev: 3, icon: "🌃" },
];

// Image Apprendre.Photo
const SAMPLE_IMAGE = "https://apprendre-la-photo.fr/wp-content/uploads/2022/10/P1230573.jpg";

function App() {
  const [apertureIndex, setApertureIndex] = useState(4); // f/4
  const [shutterIndex, setShutterIndex] = useState(6); // 1/60
  const [isoIndex, setIsoIndex] = useState(0); // ISO 100
  const [sceneIndex, setSceneIndex] = useState(0); // Plein soleil

  const aperture = APERTURES[apertureIndex];
  const shutter = SHUTTER_SPEEDS[shutterIndex];
  const iso = ISO_VALUES[isoIndex];
  const scene = SCENES[sceneIndex];

  // Calcul de l'EV des réglages
  const settingsEV = useMemo(() => {
    const ev100 = Math.log2((aperture * aperture) / shutter.value);
    const evAdjusted = ev100 - Math.log2(iso / 100);
    return evAdjusted;
  }, [aperture, shutter.value, iso]);

  const evDifference = settingsEV - scene.ev;

  const brightness = useMemo(() => {
    const brightnessValue = Math.pow(2, -evDifference);
    return Math.max(0.05, Math.min(3, brightnessValue));
  }, [evDifference]);

  const motionBlur = useMemo(() => {
    if (shutter.value >= 1 / 30) {
      return Math.min((shutter.value * 30) * 2, 15);
    }
    return 0;
  }, [shutter.value]);

  const noiseLevel = useMemo(() => {
    if (iso >= 1600) return Math.min((iso - 1600) / 1000, 1);
    if (iso >= 800) return 0.2;
    return 0;
  }, [iso]);

  const dofDescription = useMemo(() => {
    if (aperture <= 2) return "Très faible";
    if (aperture <= 4) return "Faible";
    if (aperture <= 8) return "Moyenne";
    if (aperture <= 11) return "Grande";
    return "Très grande";
  }, [aperture]);

  const exposureStatus = useMemo(() => {
    if (evDifference > 2) return { text: "Très sous-exposé", color: "red" };
    if (evDifference > 1) return { text: "Sous-exposé", color: "orange" };
    if (evDifference > 0.5) return { text: "Légèrement sous-exposé", color: "yellow" };
    if (evDifference < -2) return { text: "Très surexposé", color: "red" };
    if (evDifference < -1) return { text: "Surexposé", color: "orange" };
    if (evDifference < -0.5) return { text: "Légèrement surexposé", color: "yellow" };
    return { text: "Exposition correcte", color: "green" };
  }, [evDifference]);

  const labelStyles = {
    mt: "2",
    ml: "-2.5",
    fontSize: "xs",
  };

  return (
    <Box>
      {/* Layout principal : Image à gauche, Contrôles à droite */}
      <Flex gap={6} direction={{ base: "column", lg: "row" }}>
        
        {/* Colonne gauche : Image */}
        <Box w={{ base: "100%", lg: "30%" }} flexShrink={0}>
          <Box position="relative" borderRadius="lg" overflow="hidden" boxShadow="lg">
            <Box
              as="img"
              src={SAMPLE_IMAGE}
              alt="Photo exemple"
              width="100%"
              height="auto"
              style={{
                filter: `brightness(${brightness}) blur(${motionBlur}px)`,
                transition: "filter 0.3s ease",
              }}
            />
            
            {noiseLevel > 0 && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                opacity={noiseLevel * 0.5}
                backgroundImage="url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')"
                pointerEvents="none"
              />
            )}

            <Badge
              position="absolute"
              top={2}
              right={2}
              colorScheme={exposureStatus.color}
              fontSize="sm"
              px={2}
              py={1}
            >
              {exposureStatus.text}
            </Badge>
          </Box>

          {/* Effets sous l'image */}
          <Box mt={3} p={3} bg="white" borderRadius="md" boxShadow="sm" fontSize="sm">
            <HStack justify="space-between" mb={1}>
              <Text color="#666">Profondeur de champ :</Text>
              <Text fontWeight="medium" color="#212E40">{dofDescription}</Text>
            </HStack>
            <HStack justify="space-between" mb={1}>
              <Text color="#666">Flou de mouvement :</Text>
              <Text fontWeight="medium" color="#212E40">
                {motionBlur === 0 ? "Aucun" : motionBlur < 5 ? "Risque" : "Probable"}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="#666">Bruit :</Text>
              <Text fontWeight="medium" color="#212E40">
                {noiseLevel === 0 ? "Minimal" : noiseLevel < 0.5 ? "Visible" : "Important"}
              </Text>
            </HStack>
          </Box>
        </Box>

        {/* Colonne droite : Contrôles */}
        <Box flex="1">
          {/* Sélecteur de scène */}
          <Flex align="center" gap={3} mb={6}>
            <Text fontWeight="medium" fontSize="sm" whiteSpace="nowrap">Conditions :</Text>
            <Select
              value={sceneIndex}
              onChange={(e) => setSceneIndex(Number(e.target.value))}
              borderColor="#212E40"
              _hover={{ borderColor: "#FB9936" }}
              _focus={{ borderColor: "#FB9936", boxShadow: "0 0 0 1px #FB9936" }}
              size="sm"
            >
              {SCENES.map((s, i) => (
                <option key={i} value={i}>
                  {s.icon} {s.name} (EV {s.ev})
                </option>
              ))}
            </Select>
          </Flex>

          {/* Posemètre */}
          <Box mb={6}>
            <Text fontSize="sm" color="#666" mb={1}>Posemètre :</Text>
            <Box position="relative" h="24px" bg="#EFF7FB" borderRadius="md" overflow="hidden">
              <Flex position="absolute" top={0} left={0} right={0} bottom={0} justify="space-between" align="center" px={2}>
                <Text fontSize="xs">-3</Text>
                <Text fontSize="xs">-2</Text>
                <Text fontSize="xs">-1</Text>
                <Text fontSize="xs" fontWeight="bold">0</Text>
                <Text fontSize="xs">+1</Text>
                <Text fontSize="xs">+2</Text>
                <Text fontSize="xs">+3</Text>
              </Flex>
              <Box
                position="absolute"
                top="50%"
                left={`${50 + Math.max(-50, Math.min(50, evDifference * -16.66))}%`}
                transform="translate(-50%, -50%)"
                w="4px"
                h="16px"
                bg="#FB9936"
                borderRadius="full"
                transition="left 0.3s ease"
              />
            </Box>
          </Box>

          {/* Sliders */}
          <VStack spacing={8} align="stretch">
            {/* Ouverture */}
            <Box>
              <Flex gap={2} align="center" mb={1}>
                <Text fontWeight="medium" fontSize="sm">Ouverture</Text>
                <Tooltip label="Quantité de lumière + profondeur de champ" hasArrow>
                  <Badge colorScheme="blue" cursor="help" fontSize="xs">f/{aperture}</Badge>
                </Tooltip>
              </Flex>
              <Box px={2}>
                <Slider
                  value={apertureIndex}
                  onChange={setApertureIndex}
                  min={0}
                  max={APERTURES.length - 1}
                  step={1}
                >
                  {APERTURES.filter((_, i) => i % 2 === 0).map((val, idx) => (
                    <SliderMark key={idx} value={idx * 2} {...labelStyles}>
                      {val}
                    </SliderMark>
                  ))}
                  <SliderTrack bg="#EFF7FB">
                    <SliderFilledTrack bg="#FB9936" />
                  </SliderTrack>
                  <SliderThumb borderColor="#212E40" boxSize={4} />
                </Slider>
              </Box>
              <Flex justify="space-between" mt={5} fontSize="xs" color="#888">
                <Text>+ lumière / - netteté</Text>
                <Text>- lumière / + netteté</Text>
              </Flex>
            </Box>

            {/* Vitesse */}
            <Box>
              <Flex gap={2} align="center" mb={1}>
                <Text fontWeight="medium" fontSize="sm">Vitesse</Text>
                <Tooltip label="Quantité de lumière + flou de mouvement" hasArrow>
                  <Badge colorScheme="purple" cursor="help" fontSize="xs">{shutter.label}</Badge>
                </Tooltip>
              </Flex>
              <Box px={2}>
                <Slider
                  value={shutterIndex}
                  onChange={setShutterIndex}
                  min={0}
                  max={SHUTTER_SPEEDS.length - 1}
                  step={1}
                >
                  {SHUTTER_SPEEDS.filter((_, i) => i % 3 === 0).map((s, idx) => (
                    <SliderMark key={idx} value={idx * 3} {...labelStyles}>
                      {s.label}
                    </SliderMark>
                  ))}
                  <SliderTrack bg="#EFF7FB">
                    <SliderFilledTrack bg="#FB9936" />
                  </SliderTrack>
                  <SliderThumb borderColor="#212E40" boxSize={4} />
                </Slider>
              </Box>
              <Flex justify="space-between" mt={5} fontSize="xs" color="#888">
                <Text>- lumière / figé</Text>
                <Text>+ lumière / flou</Text>
              </Flex>
            </Box>

            {/* ISO */}
            <Box>
              <Flex gap={2} align="center" mb={1}>
                <Text fontWeight="medium" fontSize="sm">ISO</Text>
                <Tooltip label="Sensibilité du capteur + bruit" hasArrow>
                  <Badge colorScheme="green" cursor="help" fontSize="xs">{iso}</Badge>
                </Tooltip>
              </Flex>
              <Box px={2}>
                <Slider
                  value={isoIndex}
                  onChange={setIsoIndex}
                  min={0}
                  max={ISO_VALUES.length - 1}
                  step={1}
                >
                  {ISO_VALUES.filter((_, i) => i % 2 === 0).map((val, idx) => (
                    <SliderMark key={idx} value={idx * 2} {...labelStyles}>
                      {val}
                    </SliderMark>
                  ))}
                  <SliderTrack bg="#EFF7FB">
                    <SliderFilledTrack bg="#FB9936" />
                  </SliderTrack>
                  <SliderThumb borderColor="#212E40" boxSize={4} />
                </Slider>
              </Box>
              <Flex justify="space-between" mt={5} fontSize="xs" color="#888">
                <Text>- bruit / - sensible</Text>
                <Text>+ sensible / + bruit</Text>
              </Flex>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}

export default App;
