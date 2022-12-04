describe("smoke tests", () => {
  it("should work", () => {
    cy.visit("/");
    cy.get("body").should("be.visible");
  });
});
