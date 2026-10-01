"""Regression oracle for the installed-byte gate used before entrypoint execution."""
import importlib.util
from pathlib import Path
import shutil
import tempfile
import unittest


class InstalledBytes(unittest.TestCase):
    def setUp(self):
        helper = Path(__file__).with_name("installed_check.py")
        self.assertTrue(helper.is_file(), "installed-consumer checker is missing")
        spec = importlib.util.spec_from_file_location("installed_check", helper)
        self.checker = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.checker)
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.source = Path(self.temp.name).resolve() / "source"
        self.installed = Path(self.temp.name).resolve() / "installed"
        self.source.mkdir()
        (self.source / "entrypoints").mkdir()
        (self.source / "entrypoints/export.ts").write_text("installed entrypoint\n")
        (self.source / "vendor.js").write_bytes(b"bundled dependency\r\n")
        shutil.copytree(self.source, self.installed)

    def test_complete_identical_installation_is_accepted(self):
        self.checker.verify_installed(self.source, self.installed)

    def test_missing_entrypoint_is_rejected(self):
        (self.installed / "entrypoints/export.ts").unlink()
        with self.assertRaisesRegex(AssertionError, "installed file set"):
            self.checker.verify_installed(self.source, self.installed)

    def test_changed_vendor_bytes_are_rejected(self):
        (self.installed / "vendor.js").write_bytes(b"different dependency\n")
        with self.assertRaisesRegex(AssertionError, "installed bytes"):
            self.checker.verify_installed(self.source, self.installed)

    def test_symlink_back_to_checkout_is_rejected(self):
        target = self.installed / "entrypoints/export.ts"
        target.unlink()
        target.symlink_to(self.source / "entrypoints/export.ts")
        with self.assertRaisesRegex(AssertionError, "symlink"):
            self.checker.verify_installed(self.source, self.installed)

    def test_extension_root_symlink_is_rejected(self):
        shutil.rmtree(self.installed)
        self.installed.symlink_to(self.source, target_is_directory=True)
        with self.assertRaisesRegex(AssertionError, "symlink"):
            self.checker.verify_installed(self.source, self.installed)

    def test_extension_ancestor_symlink_is_rejected(self):
        alias = self.installed.parent / "extensions-alias"
        alias.symlink_to(self.source.parent, target_is_directory=True)
        with self.assertRaisesRegex(AssertionError, "symlink"):
            self.checker.verify_installed(self.source, alias / self.source.name)


if __name__ == "__main__":
    unittest.main()
