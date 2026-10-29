async function handleLogin(event) {
  event.preventDefault();

  if (loading) return;

  setLoading(true);
  setErrorMessage("");

  try {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMessage("ইমেইল ও পাসওয়ার্ড লিখুন।");
      return;
    }

    // Supabase Client তৈরি হবে শুধু Login করার সময়
    const supabase = createClient();

    // 1. Sign in
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (loginError) {
      setErrorMessage("ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।");
      return;
    }

    // 2. Check admin permission
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (adminError || isAdmin !== true) {
      await supabase.auth.signOut();

      setErrorMessage(
        adminError
          ? "Admin Permission যাচাই করা যায়নি।"
          : "এই অ্যাকাউন্টের Admin Permission নেই।",
      );

      return;
    }

    // 3. Redirect to dashboard
    router.replace("/dashboard");
    router.refresh();
  } catch (error) {
    console.error("Login error:", error);

    setErrorMessage("লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
  } finally {
    setLoading(false);
  }
}
