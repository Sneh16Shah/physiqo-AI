"""
Body Composition Metric Derivation Engine.

After OCR extraction, this module fills in missing metrics using
established physiological formulas. It tracks which fields were
derived (vs. directly extracted) so the frontend can display badges.

Formulas used:
    - BMI:              weight / (height_m)^2
    - Body Fat %:       (fat_mass / weight) * 100
    - Body Fat Mass:    weight * (fat_pct / 100)
    - Fat-Free Mass:    weight - fat_mass
    - Water Content:    FFM * 0.732  (Pace & Rathbun)
    - Water %:          (water / weight) * 100
    - Protein:          FFM * 0.16
    - Inorganic Salt:   FFM * 0.055
    - BMR (kcal):       370 + 21.6 * FFM  (Katch-McArdle)
"""

import logging
from typing import Optional
from app.schemas.ocr import BodyCompositionMeasurementExtracted

logger = logging.getLogger(__name__)

# Mandatory field keys (at least one form of body fat is required)
MANDATORY_FIELDS = ["weight_kg", "skeletal_muscle_mass_kg"]
MANDATORY_FAT_FIELDS = ["body_fat_kg", "body_fat_percentage"]  # at least one needed


def derive_missing_metrics(
    measurement: BodyCompositionMeasurementExtracted,
    height_cm: Optional[float] = None,
) -> list[str]:
    """
    Fill in missing derivable fields on *measurement* in-place.

    Parameters
    ----------
    measurement : BodyCompositionMeasurementExtracted
        The OCR-extracted measurement object (mutated in-place).
    height_cm : float | None
        User height in cm (from user profile or OCR header).

    Returns
    -------
    list[str]
        Names of fields that were derived (not directly extracted).
    """
    derived: list[str] = []

    # Use height from OCR if available, otherwise use the passed-in value
    effective_height = measurement.height_cm or height_cm

    # --- Cross-derive body fat mass <-> percentage ---
    if measurement.body_fat_kg is not None and measurement.body_fat_percentage is None:
        if measurement.weight_kg and measurement.weight_kg > 0:
            measurement.body_fat_percentage = round(
                (measurement.body_fat_kg / measurement.weight_kg) * 100, 1
            )
            derived.append("body_fat_percentage")
            logger.info(f"Derived body_fat_percentage = {measurement.body_fat_percentage}%")

    elif measurement.body_fat_percentage is not None and measurement.body_fat_kg is None:
        if measurement.weight_kg and measurement.weight_kg > 0:
            measurement.body_fat_kg = round(
                measurement.weight_kg * (measurement.body_fat_percentage / 100), 2
            )
            derived.append("body_fat_kg")
            logger.info(f"Derived body_fat_kg = {measurement.body_fat_kg} kg")

    # --- Fat-Free Mass ---
    if measurement.fat_free_mass_kg is None:
        if measurement.weight_kg and measurement.body_fat_kg is not None:
            measurement.fat_free_mass_kg = round(
                measurement.weight_kg - measurement.body_fat_kg, 2
            )
            derived.append("fat_free_mass_kg")
            logger.info(f"Derived fat_free_mass_kg = {measurement.fat_free_mass_kg} kg")

    ffm = measurement.fat_free_mass_kg  # shorthand for downstream calcs

    # --- BMI ---
    if measurement.bmi is None:
        if measurement.weight_kg and effective_height and effective_height > 0:
            height_m = effective_height / 100.0
            measurement.bmi = round(measurement.weight_kg / (height_m ** 2), 1)
            derived.append("bmi")
            logger.info(f"Derived bmi = {measurement.bmi} kg/m²")

    # --- Water Content ---
    if measurement.water_content_kg is None and ffm is not None:
        measurement.water_content_kg = round(ffm * 0.732, 1)
        derived.append("water_content_kg")
        logger.info(f"Derived water_content_kg = {measurement.water_content_kg} kg")

    # --- Water Percentage ---
    if measurement.water_percentage is None:
        if measurement.water_content_kg and measurement.weight_kg and measurement.weight_kg > 0:
            measurement.water_percentage = round(
                (measurement.water_content_kg / measurement.weight_kg) * 100, 1
            )
            derived.append("water_percentage")
            logger.info(f"Derived water_percentage = {measurement.water_percentage}%")

    # --- Protein ---
    if measurement.protein_kg is None and ffm is not None:
        measurement.protein_kg = round(ffm * 0.16, 2)
        derived.append("protein_kg")
        logger.info(f"Derived protein_kg = {measurement.protein_kg} kg")

    # --- Inorganic Salt ---
    if measurement.inorganic_salt_kg is None and ffm is not None:
        measurement.inorganic_salt_kg = round(ffm * 0.055, 2)
        derived.append("inorganic_salt_kg")
        logger.info(f"Derived inorganic_salt_kg = {measurement.inorganic_salt_kg} kg")

    # --- BMR (Katch-McArdle) ---
    if measurement.bmr_kcal is None and ffm is not None:
        measurement.bmr_kcal = round(370 + 21.6 * ffm)
        derived.append("bmr_kcal")
        logger.info(f"Derived bmr_kcal = {measurement.bmr_kcal} kcal")

    return derived


def get_missing_mandatory(measurement: BodyCompositionMeasurementExtracted) -> list[str]:
    """Return list of mandatory field names that are still None/missing."""
    missing = []
    for field in MANDATORY_FIELDS:
        if getattr(measurement, field, None) is None:
            missing.append(field)

    # At least one form of body fat is required
    has_fat = any(
        getattr(measurement, f, None) is not None for f in MANDATORY_FAT_FIELDS
    )
    if not has_fat:
        missing.append("body_fat_kg_or_percentage")

    return missing
