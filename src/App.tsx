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

// Image Unsplash (portrait en extérieur, libre de droits)
const SAMPLE_IMAGE = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80";

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
  // EV = log2(N² / t) - log2(ISO / 100)
  const settingsEV = useMemo(() => {
    const ev100 = Math.log2((aperture * aperture) / shutter.value);
    const evAdjusted = ev100 - Math.log2(iso / 100);
    return evAdjusted;
  }, [aperture, shutter.value, iso]);

  // Différence entre l'EV de la scène et l'EV des réglages
  const evDifference = settingsEV - scene.ev;

  // Calcul de la luminosité (1 = correct, <1 = sombre, >1 = clair)
  const brightness = useMemo(() => {
    // Chaque stop de différence double ou divise la luminosité
    const brightnessValue = Math.pow(2, -evDifference);
    // Limiter entre 0.05 et 3 pour garder un rendu visible
    return Math.max(0.05, Math.min(3, brightnessValue));
  }, [evDifference]);

  // Niveau de flou de mouvement (basé sur la vitesse)
  const motionBlur = useMemo(() => {
    if (shutter.value >= 1 / 30) {
      // En dessous de 1/30, risque de flou
      return Math.min((shutter.value * 30) * 2, 15);
    }
    return 0;
  }, [shutter.value]);

  // Niveau de bruit (basé sur l'ISO)
  const noiseLevel = useMemo(() => {
    if (iso >= 1600) {
      return Math.min((iso - 1600) / 1000, 1);
    }
    if (iso >= 800) {
      return 0.2;
    }
    return 0;
  }, [iso]);

  // Indicateur de profondeur de champ
  const dofDescription = useMemo(() => {
    if (aperture <= 2) return "Très faible (arrière-plan très flou)";
    if (aperture <= 4) return "Faible (arrière-plan flou)";
    if (aperture <= 8) return "Moyenne";
    if (aperture <= 11) return "Grande";
    return "Très grande (tout est net)";
  }, [aperture]);

  // Statut d'exposition
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
    fontSize: "sm",
  };

  return (
    <Box>
      {/* Titre */}
      <Text fontSize="2xl" fontWeight="bold" textAlign="center" color="#212E40" mb={6}>
        Triangle d'exposition
      </Text>

      {/* Sélecteur de scène */}
      <Box mb={6}>
        <Flex align="center" gap={4}>
          <Text fontWeight="medium" minW="120px">Conditions :</Text>
          <Select
            value={sceneIndex}
            onChange={(e) => setSceneIndex(Number(e.target.value))}
            borderColor="#212E40"
            _hover={{ borderColor: "#FB9936" }}
            _focus={{ borderColor: "#FB9936", boxShadow: "0 0 0 1px #FB9936" }}
            maxW="300px"
          >
            {SCENES.map((s, i) => (
              <option key={i} value={i}>
                {s.icon} {s.name} (EV {s.ev})
              </option>
            ))}
          </Select>
        </Flex>
      </Box>

      {/* Zone principale : Image + Indicateurs */}
      <Flex gap={6} mb={8} direction={{ base: "column", md: "row" }}>
        {/* Image avec effets */}
        <Box flex="1" position="relative">
          <Box
            position="relative"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="lg"
          >
            {/* Image principale */}
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
            
            {/* Overlay de bruit */}
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

            {/* Badge d'exposition */}
            <Badge
              position="absolute"
              top={3}
              right={3}
              colorScheme={exposureStatus.color}
              fontSize="md"
              px={3}
              py={1}
            >
              {exposureStatus.text}
            </Badge>
          </Box>
        </Box>

        {/* Panneau d'informations */}
        <Box minW="280px" bg="white" p={4} borderRadius="lg" boxShadow="md">
          <VStack align="stretch" spacing={4}>
            <Text fontWeight="bold" color="#212E40" borderBottom="2px solid #FB9936" pb={2}>
              Effets des réglages
            </Text>

            {/* Profondeur de champ */}
            <Box>
              <HStack justify="space-between">
                <Text fontSize="sm" color="#666">Profondeur de champ :</Text>
              </HStack>
              <Text fontWeight="medium" color="#212E40">{dofDescription}</Text>
            </Box>

            {/* Flou de mouvement */}
            <Box>
              <HStack justify="space-between">
                <Text fontSize="sm" color="#666">Flou de mouvement :</Text>
              </HStack>
              <Text fontWeight="medium" color="#212E40">
                {motionBlur === 0 
                  ? "Aucun (mouvement figé)" 
                  : motionBlur < 5 
                    ? "Léger risque de flou" 
                    : "Flou de bougé probable"}
              </Text>
            </Box>

            {/* Bruit numérique */}
            <Box>
              <HStack justify="space-between">
                <Text fontSize="sm" color="#666">Bruit numérique :</Text>
              </HStack>
              <Text fontWeight="medium" color="#212E40">
                {noiseLevel === 0 
                  ? "Minimal" 
                  : noiseLevel < 0.5 
                    ? "Visible" 
                    : "Important"}
              </Text>
            </Box>

            {/* Posemètre */}
            <Box mt={4}>
              <Text fontSize="sm" color="#666" mb={2}>Posemètre :</Text>
              <Box position="relative" h="30px" bg="#EFF7FB" borderRadius="md" overflow="hidden">
                {/* Graduation */}
                <Flex position="absolute" top={0} left={0} right={0} bottom={0} justify="space-between" align="center" px={2}>
                  <Text fontSize="xs">-3</Text>
                  <Text fontSize="xs">-2</Text>
                  <Text fontSize="xs">-1</Text>
                  <Text fontSize="xs" fontWeight="bold">0</Text>
                  <Text fontSize="xs">+1</Text>
                  <Text fontSize="xs">+2</Text>
                  <Text fontSize="xs">+3</Text>
                </Flex>
                {/* Indicateur */}
                <Box
                  position="absolute"
                  top="50%"
                  left={`${50 + Math.max(-50, Math.min(50, evDifference * -16.66))}%`}
                  transform="translate(-50%, -50%)"
                  w="4px"
                  h="20px"
                  bg="#FB9936"
                  borderRadius="full"
                  transition="left 0.3s ease"
                />
              </Box>
            </Box>
          </VStack>
        </Box>
      </Flex>

      {/* Contrôles */}
      <VStack spacing={10} align="stretch" px={4}>
        {/* Ouverture */}
        <Box>
          <Flex gap={2} align="center" mb={2}>
            <Text fontWeight="medium" minW="180px">Ouverture (diaphragme)</Text>
            <Tooltip label="Contrôle la quantité de lumière ET la profondeur de champ" hasArrow>
              <Badge colorScheme="blue" cursor="help">f/{aperture}</Badge>
            </Tooltip>
          </Flex>
          <Slider
            value={apertureIndex}
            onChange={setApertureIndex}
            min={0}
            max={APERTURES.length - 1}
            step={1}
          >
            {APERTURES.map((val, i) => (
              <SliderMark key={i} value={i} {...labelStyles}>
                f/{val}
              </SliderMark>
            ))}
            <SliderTrack bg="#EFF7FB">
              <SliderFilledTrack bg="#FB9936" />
            </SliderTrack>
            <SliderThumb borderColor="#212E40" boxSize={5} />
          </Slider>
          <Flex justify="space-between" mt={6} fontSize="xs" color="#666">
            <Text>← Plus de lumière / Moins de netteté</Text>
            <Text>Moins de lumière / Plus de netteté →</Text>
          </Flex>
        </Box>

        {/* Vitesse */}
        <Box>
          <Flex gap={2} align="center" mb={2}>
            <Text fontWeight="medium" minW="180px">Vitesse d'obturation</Text>
            <Tooltip label="Contrôle la quantité de lumière ET le flou de mouvement" hasArrow>
              <Badge colorScheme="purple" cursor="help">{shutter.label}</Badge>
            </Tooltip>
          </Flex>
          <Slider
            value={shutterIndex}
            onChange={setShutterIndex}
            min={0}
            max={SHUTTER_SPEEDS.length - 1}
            step={1}
          >
            {SHUTTER_SPEEDS.filter((_, i) => i % 2 === 0).map((s, idx) => (
              <SliderMark key={idx} value={idx * 2} {...labelStyles}>
                {s.label}
              </SliderMark>
            ))}
            <SliderTrack bg="#EFF7FB">
              <SliderFilledTrack bg="#FB9936" />
            </SliderTrack>
            <SliderThumb borderColor="#212E40" boxSize={5} />
          </Slider>
          <Flex justify="space-between" mt={6} fontSize="xs" color="#666">
            <Text>← Moins de lumière / Mouvement figé</Text>
            <Text>Plus de lumière / Risque de flou →</Text>
          </Flex>
        </Box>

        {/* ISO */}
        <Box>
          <Flex gap={2} align="center" mb={2}>
            <Text fontWeight="medium" minW="180px">Sensibilité ISO</Text>
            <Tooltip label="Amplifie le signal lumineux mais ajoute du bruit" hasArrow>
              <Badge colorScheme="green" cursor="help">ISO {iso}</Badge>
            </Tooltip>
          </Flex>
          <Slider
            value={isoIndex}
            onChange={setIsoIndex}
            min={0}
            max={ISO_VALUES.length - 1}
            step={1}
          >
            {ISO_VALUES.map((val, i) => (
              <SliderMark key={i} value={i} {...labelStyles}>
                {val}
              </SliderMark>
            ))}
            <SliderTrack bg="#EFF7FB">
              <SliderFilledTrack bg="#FB9936" />
            </SliderTrack>
            <SliderThumb borderColor="#212E40" boxSize={5} />
          </Slider>
          <Flex justify="space-between" mt={6} fontSize="xs" color="#666">
            <Text>← Moins de bruit / Moins sensible</Text>
            <Text>Plus sensible / Plus de bruit →</Text>
          </Flex>
        </Box>
      </VStack>

      {/* Footer */}
      <Box p={4} pt={10}>
        <Flex direction="column" align="center" gap={2}>
          <Text fontSize="sm" color="#212E40">
            Simulateur du triangle d'exposition pour{" "}
            <a
              href="https://apprendre.photo"
              target="_blank"
              style={{ color: "#FB9936", fontWeight: "bold" }}
            >
              Apprendre.Photo
            </a>
          </Text>
          <Text fontSize="xs" color="#666">
            Photo par{" "}
            <a
              href="https://unsplash.com/@afrashidnawab"
              target="_blank"
              style={{ color: "#FB9936" }}
            >
              Afrashid Nawab
            </a>
            {" "}sur Unsplash
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}

export default App;
