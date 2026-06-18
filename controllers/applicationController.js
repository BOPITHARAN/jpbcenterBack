const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to dynamically detect the correct bucket name
const getActiveBucket = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const names = (buckets || []).map(b => b.name.toLowerCase());
    
    // Check which variant exists in your storage system
    if (names.includes("applications")) return "applications";
    if (names.includes("application")) return "application";
    if (names.includes("resumes")) return "resumes";
    if (names.includes("resume")) return "resume";
    
    // Fallback default
    return names[0] || "applications";
  } catch {
    return "applications";
  }
};

// 1. APPLY JOB (With Multi-Bucket Fallback Support)
const applyJob = async (req, res) => {
  try {
    const { job_id, job_title, company, name, email, phone, message } = req.body;
    const file = req.file;

    if (!job_id || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and job ID are required tools for entry!",
      });
    }

    const numericJobId = parseInt(job_id, 10);
    if (isNaN(numericJobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID format detected! Must be a valid number.",
      });
    }

    let resumeUrl = null;

    // FILE UPLOAD PIPELINE
    if (file) {
      const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
      
      // 🌟 DYNAMIC FIX: Automatically detects your storage bucket name to end "Bucket not found" errors
      const targetBucket = await getActiveBucket();
      console.log(`🚀 Routing upload file stream directly into verified bucket: '${targetBucket}'`);

      const { error: uploadError } = await supabase.storage
        .from(targetBucket) 
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) {
        return res.status(500).json({ 
          success: false, 
          message: `Supabase Storage Upload Failure: ${uploadError.message}. Verified active bucket was: '${targetBucket}'` 
        });
      }

      const { data: publicData, publicURL } = supabase.storage.from(targetBucket).getPublicUrl(fileName);
      resumeUrl = publicData?.publicUrl || publicURL;
    }

    // Insert record metrics into applications table
    const { data, error } = await supabase
      .from("applications")
      .insert([
        {
          job_id: numericJobId,
          job_title,
          company,
          name,
          email,
          phone,
          resume: resumeUrl, 
          message,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Database Error: ${error.message}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      id: data.id,
      resume: resumeUrl, 
    });
  } catch (err) {
    console.error("Apply Job Exception Logs:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// 2. GET APPLICATIONS LIST
const getApplications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// 3. DELETE APPLICATION RECORD
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "null" || id === "undefined") {
      return res.status(400).json({ success: false, message: "Valid application target ID is required!" });
    }

    const { data: app, error: fetchError } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .single();

    if (!fetchError && app && app.resume) {
      try {
        const targetBucket = await getActiveBucket();
        const fileName = app.resume.split("/").pop();
        await supabase.storage.from(targetBucket).remove([fileName]);
      } catch (storageErr) {
        console.warn("Wiping target resume file context skipped:", storageErr.message);
      }
    }

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  applyJob,
  getApplications,
  deleteApplication,
};