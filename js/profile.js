/* =========================================================
   KHET2GHAR FARMER
   profile.js
   Load + Save Farmer Profile (Fixed Form Separation)
   ========================================================= */

import { supabase } from "./supabase.js";
import { showToast } from "./app.js";

let currentUser = null;
let currentFarmer = null;

document.addEventListener("DOMContentLoaded", async () => {
    await loadProfile();
    setupProfileForm();
    setupFarmForm();
});

async function loadProfile() {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
            window.location.replace("index.html");
            return;
        }

        currentUser = user;

        const emailElement = document.getElementById("farmerEmail");
        if (emailElement) {
            emailElement.textContent = user.email || "";
        }

        // Load profiles table
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
            console.warn("Profile fetch note:", profileError.message);
        }

        // Load farmers table
        const { data: farmer, error: farmerError } = await supabase
            .from("farmers")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (farmerError) {
            console.warn("Farmer fetch note:", farmerError.message);
        }

        currentFarmer = farmer;

        if (profile) {
            setValue("fullName", profile.full_name);
            setValue("mobile", profile.mobile);
            setValue("village", profile.village);
            setValue("district", profile.district);
            setValue("state", profile.state);

            const farmerName = document.getElementById("farmerName");
            if (farmerName) {
                farmerName.textContent = profile.full_name || "Farmer";
            }
        }

        if (farmer) {
            setValue("farmName", farmer.farm_name);
            setValue("farmSize", farmer.farm_size);
            setValue("farmingType", farmer.farming_type || "organic");
        }
    } catch (error) {
        console.error("Load profile error:", error);
        showProfileMessage("Unable to load profile details.", "error");
    }
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value ?? "";
    }
}

function setupProfileForm() {
    const form = document.getElementById("profileForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!currentUser) {
            showProfileMessage("Please login first.", "error");
            return;
        }

        const fullName = document.getElementById("fullName")?.value.trim();
        const mobile = document.getElementById("mobile")?.value.trim();
        const village = document.getElementById("village")?.value.trim();
        const district = document.getElementById("district")?.value.trim();
        const state = document.getElementById("state")?.value.trim();

        const { error } = await supabase
            .from("profiles")
            .upsert({
                id: currentUser.id,
                full_name: fullName,
                mobile: mobile,
                village: village,
                district: district,
                state: state,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error("Save profile error:", error);
            showProfileMessage(error.message, "error");
            return;
        }

        const farmerName = document.getElementById("farmerName");
        if (farmerName) {
            farmerName.textContent = fullName || "Farmer";
        }

        showProfileMessage("Personal profile saved successfully ✓", "success");
    });
}

function setupFarmForm() {
    const form = document.getElementById("farmForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!currentUser) {
            showProfileMessage("Please login first.", "error");
            return;
        }

        const farmName = document.getElementById("farmName")?.value.trim();
        const farmSize = document.getElementById("farmSize")?.value.trim();
        const farmingType = document.getElementById("farmingType")?.value;
        const village = document.getElementById("village")?.value.trim();
        const district = document.getElementById("district")?.value.trim();
        const state = document.getElementById("state")?.value.trim();

        const { data: existingFarmer } = await supabase
            .from("farmers")
            .select("id")
            .eq("user_id", currentUser.id)
            .maybeSingle();

        if (existingFarmer) {
            const { error } = await supabase
                .from("farmers")
                .update({
                    farm_name: farmName,
                    farm_size: farmSize,
                    farming_type: farmingType,
                    farm_location: village,
                    district: district,
                    state: state,
                    updated_at: new Date().toISOString()
                })
                .eq("id", existingFarmer.id);

            if (error) {
                showProfileMessage(error.message, "error");
                return;
            }
        } else {
            const { error } = await supabase
                .from("farmers")
                .insert({
                    user_id: currentUser.id,
                    farm_name: farmName || "My Farm",
                    farm_size: farmSize || null,
                    farming_type: farmingType || "organic",
                    farm_location: village || null,
                    district: district || null,
                    state: state || null,
                    verification_status: "pending"
                });

            if (error) {
                showProfileMessage(error.message, "error");
                return;
            }
        }

        showProfileMessage("Farm details saved successfully ✓", "success");
    });
}

function showProfileMessage(message, type = "success") {
    if (typeof showToast === "function") {
        showToast(message);
    } else {
        alert(message);
    }
}
